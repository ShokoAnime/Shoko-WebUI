import { useMemo } from 'react';
import jsonSchema from 'json-schema';
import { cloneDeep, get } from 'lodash';

import type { JSONSchema4WithUiDefinition, ValidationResult } from './react-query/configuration/types';

const { validate: internalValidate } = jsonSchema;

export function assertIsNullable(object: JSONSchema4WithUiDefinition): boolean {
  if (object.type === 'null' || (object.type instanceof Array && object.type.includes('null'))) return true;
  if (object.anyOf !== undefined && object.anyOf.length > 0 && object.anyOf.some(obj => obj.type === 'null')) {
    return true;
  }
  if (object.allOf !== undefined && object.allOf.length > 0 && object.allOf.some(obj => obj.type === 'null')) {
    return true;
  }
  if (object.oneOf !== undefined && object.oneOf.length > 0 && object.oneOf.some(obj => obj.type === 'null')) {
    return true;
  }
  return false;
}

export function assertIsRequired(schema: JSONSchema4WithUiDefinition, parentSchema?: JSONSchema4WithUiDefinition | null | undefined, key?: string | symbol | number | null | undefined): boolean {
  if (!assertIsNullable(schema) || parentSchema == null) return true;
  if (key == null) return false;
  if (typeof parentSchema.required === 'boolean') return parentSchema.required;
  if (parentSchema.required == null || parentSchema.required.length === 0) return false;
  return parentSchema.required.some(name => name === key);
}

export function useReference(
  rootSchema: JSONSchema4WithUiDefinition,
  schema: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  return useMemo(() => resolveReference(rootSchema, schema), [rootSchema, schema]);
}

export function resolveReference(
  rootSchema: JSONSchema4WithUiDefinition,
  object: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  if (object.$ref != null) return get(rootSchema, object.$ref.substring(2).split('/')) as JSONSchema4WithUiDefinition;

  if (object.oneOf !== undefined && object.oneOf.length > 0) {
    const ref = object.oneOf.find(obj => obj.$ref !== undefined)?.$ref;
    if (ref != null) return get(rootSchema, ref.substring(2).split('/')) as JSONSchema4WithUiDefinition;
    return object.oneOf.find(obj => obj.type !== 'null') ?? object.oneOf[0];
  }

  if (object.anyOf !== undefined && object.anyOf.length > 0) {
    const ref = object.anyOf.find(obj => obj.$ref !== undefined)?.$ref;
    if (ref != null) return get(rootSchema, ref.substring(2).split('/')) as JSONSchema4WithUiDefinition;
    return object.anyOf.find(obj => obj.type !== 'null') ?? object.anyOf[0];
  }

  return object;
}

export function useListReference(
  rootSchema: JSONSchema4WithUiDefinition,
  object: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  return useMemo(() => resolveListReference(rootSchema, object), [rootSchema, object]);
}

export function resolveListReference(
  rootSchema: JSONSchema4WithUiDefinition,
  object: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  return resolveReference(rootSchema, object.items as JSONSchema4WithUiDefinition);
}

export function useDictReference(
  rootSchema: JSONSchema4WithUiDefinition,
  object: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  return useMemo(() => resolveDictReference(rootSchema, object), [rootSchema, object]);
}

export function resolveDictReference(
  rootSchema: JSONSchema4WithUiDefinition,
  object: JSONSchema4WithUiDefinition,
): JSONSchema4WithUiDefinition {
  return resolveReference(rootSchema, object.additionalProperties as JSONSchema4WithUiDefinition);
}
export const invalidPropertyNameCharacters = [
  '.',
  '[',
  ']',
  '(',
  ')',
  '{',
  '}',
  '"',
  '/',
  '\\',
  '\'',
  ' ',
  '\t',
  '\r',
  '\n',
  '\b',
  '\f',
] as const;

export function pathToString(path: (string | number)[], alwaysEscape = false): string {
  return path.reduce<string>((propertyPath, property) => constructPath(propertyPath, property, alwaysEscape), '');
}

function constructPath(propertyPath: string, name: string | number, alwaysEscape = false): string {
  if (typeof name === 'number') return `${propertyPath}[${name}]`;

  let propertyName = name;
  // Escape property name if it contains any of these characters.
  if (alwaysEscape || invalidPropertyNameCharacters.some(char => propertyName.includes(char))) {
    if (propertyName.includes('\'')) {
      propertyName = propertyName.replace(/(?<!\\)'/g, '\\\'');
    }
    propertyName = `['${propertyName}']`;
    return propertyPath ? propertyPath + propertyName : propertyName;
  }
  return propertyPath ? `${propertyPath}.${propertyName}` : propertyName;
}

export function validate(
  rootSchema: JSONSchema4WithUiDefinition,
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
): ValidationResult {
  if (rootSchema === schema) {
    return internalValidate(config as never, rootSchema);
  }
  return internalValidate(config as never, {
    ...schema,
    definitions: rootSchema.definitions,
  });
}

export function createDefaultItemForSchema(
  rootSchema: JSONSchema4WithUiDefinition,
  schema: JSONSchema4WithUiDefinition,
  parentSchema: JSONSchema4WithUiDefinition | null = null,
  path: (string | number)[] = [],
  force = false
): unknown {
  const isNullable = assertIsNullable(schema);
  const isRequired = assertIsRequired(schema, parentSchema, path[path.length - 1]);
  const resolvedSchema = resolveReference(rootSchema, schema);
  const types = Array.isArray(resolvedSchema.type) ? resolvedSchema.type.filter(tpe => tpe !== 'null') : [resolvedSchema.type];
  if (types[0] !== 'object') {
    if (types[0] === 'array') {
      if (resolvedSchema.minItems !== undefined && resolvedSchema.minItems > 0) {
        return new Array(resolvedSchema.minItems).fill(0)
          .map((_, index) => createDefaultItemForSchema(rootSchema, resolveListReference(rootSchema, resolvedSchema), resolvedSchema, [...path, index]));
      }
      return [];
    }
    const min = resolvedSchema.minimum;
    const max = resolvedSchema.maximum;
    switch (types[0]) {
      case 'integer':
      case 'number':
        if (
          schema.default != null && typeof schema.default === 'number'
          && (min == null || schema.default >= min) && (max == null || schema.default <= max)
        ) {
          return schema.default;
        }
        if (isNullable && !isRequired) {
          return null;
        }
        if (min != null) {
          return min;
        }
        if (max != null && max < 0) {
          return max;
        }
        return 0;
      case 'string':
        if (schema.default != null && typeof schema.default === 'string') {
          return schema.default;
        }
        if (isNullable && !isRequired) {
          return null;
        }
        return '';
      case 'boolean':
        if (isNullable && !isRequired) {
          return null;
        }
        return false;
      default:
        break;
    }
    if (schema.default != null) {
      if (typeof schema.default === 'string' && schema.default.startsWith('{') && schema.default.endsWith('}')) {
        return JSON.parse(schema.default) as unknown;
      }
      return cloneDeep(schema.default);
    }
    if (isNullable && !isRequired) {
      return null;
    }
    return null;
  }

  if (schema.default != null) {
    if (typeof schema.default === 'string' && schema.default.startsWith('{') && schema.default.endsWith('}')) {
      return JSON.parse(schema.default) as Record<string, unknown>;
    }
  }

  if (!resolvedSchema.properties) {
    return {};
  }

  if (!force && isNullable && !isRequired) {
    return null;
  }

  const obj = {} as Record<string, unknown>;
  for (const [key, valueSchema] of Object.entries(resolvedSchema.properties)) {
    obj[key] = createDefaultItemForSchema(rootSchema, valueSchema, resolvedSchema, [...path, key]);
  }

  return obj;
}
