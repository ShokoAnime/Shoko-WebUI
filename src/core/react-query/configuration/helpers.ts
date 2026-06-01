import { get } from 'lodash';

import type { FormSchemaType, PropertySchemaType } from '@/core/types/api/configuration';

// ── $ref resolution ─────────────────────────────────────────────────────
// Shoko Server emits JSON Schema draft-04 where properties often use
// `$ref: "#/definitions/Foo"` instead of inline types.  The type info
// (type, maximum, minimum, etc.) lives on the definition, but *UI metadata*
// (x-uiDefinition, title, default) lives on the property that holds the
// $ref.  A standards-compliant dereferencer would replace the entire node,
// discarding the UI metadata.  We selectively merge only the structural
// fields we need so x-uiDefinition stays where the server placed it.
//
// This runs as a `select` transform on the schema query — resolved once,
// cached by React Query, and never touched again at the component level.

// Convert a JSON Pointer path (#/definitions/X) into a lodash dot-path
// (definitions.X), then pull the value from the schema tree.
const resolveRef = (root: FormSchemaType, path: string): PropertySchemaType | undefined =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  get(root, path.substring(2).replace(/\//g, '.'));

// Merge type information from a $ref target into a property, keeping the
// original property's UI metadata (x-uiDefinition, title, etc.) intact.
const resolveProp = (schema: FormSchemaType, prop: PropertySchemaType): PropertySchemaType => {
  // Bail out if there is no $ref, or if the property already has an inline
  // type (the inline definition wins).
  if (!prop.$ref || prop.type) return prop;

  const def = resolveRef(schema, prop.$ref);
  if (!def) return prop;

  return {
    ...prop,
    // Structural fields merged from the definition
    type: def.type,
    maximum: def.maximum,
    minimum: def.minimum,
    // Description: property-level override takes precedence over definition
    description: prop.description ?? def.description,
  };
};

// Apply a transform function to every property in a record, preserving keys.
const mapProps = (
  record: Record<string, PropertySchemaType>,
  mapper: (property: PropertySchemaType) => PropertySchemaType,
) => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, mapper(value)]));

// Resolves $ref at two levels:
//  1. Top-level schema.properties (e.g. { "$ref": "#/definitions/WebAOM" })
//  2. Inside each definition's own .properties (for defs that reference
//     other defs, e.g. ImageTemplateUrl → $ref to DataSource).
//
// Note: defObj alias on line 42 works around the base JSONSchema4 type
// where `definitions` is `Record<string, JSONSchema4>` — the alias lets us
// access `.properties` without a separate assertion per occurrence.
export const resolveSchemaRefs = (schema: FormSchemaType): FormSchemaType => {
  const resolveFor = (property: PropertySchemaType) => resolveProp(schema, property);

  // Level 1: resolve refs in the schema's own properties
  const resolvedProperties = mapProps(schema.properties, resolveFor);

  // Level 2: resolve refs inside each definition's nested properties
  const resolvedDefinitions = schema.definitions
    ? mapProps(schema.definitions, (def) => {
      const defObj = def;
      return defObj.properties
        ? { ...defObj, properties: mapProps(defObj.properties, resolveFor) }
        : defObj;
    })
    : undefined;

  return { ...schema, definitions: resolvedDefinitions, properties: resolvedProperties };
};
