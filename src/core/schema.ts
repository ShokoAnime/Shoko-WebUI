import { useMemo } from 'react';
import { get } from 'lodash';

import type { JSONSchema4WithUiDefinition } from './react-query/configuration/types';

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
      propertyName = propertyName.replace(/'/g, '\\\'');
    }
    propertyName = `['${propertyName}']`;
    return propertyPath ? propertyPath + propertyName : propertyName;
  }
  return propertyPath ? `${propertyPath}.${propertyName}` : propertyName;
}

export function createDefaultItemForSchema(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rootSchema: JSONSchema4WithUiDefinition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schema: JSONSchema4WithUiDefinition,
): unknown {
  // TODO: implement this thing.

  return {};
}
