export type Schema =
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | BooleanSchema
  | NullSchema;

// export type JsonType = "object" | "array" | "string" | "number" | "boolean" | "null" | "integer";

// export interface JSONSchema {
//   type?: string | undefined;
//   $id?: string | undefined;
//   id?: string | undefined;
//   $schema?: string | undefined;
//   $ref?: string | undefined;
//   $anchor?: string | undefined;
//   $defs?: { [key: string]: JSONSchema } | undefined;
//   definitions?: { [key: string]: JSONSchema } | undefined;
//   $comment?: string | undefined;
//   title?: string | undefined;
//   description?: string | undefined;
//   default?: unknown | undefined;
//   examples?: unknown[] | undefined;
//   readOnly?: boolean | undefined;
//   writeOnly?: boolean | undefined;
//   deprecated?: boolean | undefined;
//   allOf?: JSONSchema[] | undefined;
//   anyOf?: JSONSchema[] | undefined;
//   oneOf?: JSONSchema[] | undefined;
//   not?: JSONSchema | undefined;
//   if?: JSONSchema | undefined;
//   then?: JSONSchema | undefined;
//   else?: JSONSchema | undefined;
//   enum?: Array<string | number | boolean | null> | undefined;
//   const?: string | number | boolean | null | undefined;
//   [k: string]: unknown;

//   /** A special key used as an intermediate representation of extends-style relationships. Omitted as a $ref with additional properties. */
//   // _ref?: JSONSchema;
//   _prefault?: unknown | undefined;
// }

export type _JSONSchema = boolean | JSONSchema;
export type JSONSchema = {
  [k: string]: unknown;
  $schema?: "https://json-schema.org/draft/2020-12/schema" | "http://json-schema.org/draft-07/schema#" | undefined;
  $id?: string | undefined;
  $anchor?: string | undefined;
  $ref?: string | undefined;
  $dynamicRef?: string | undefined;
  $dynamicAnchor?: string | undefined;
  $vocabulary?: Record<string, boolean> | undefined;
  $comment?: string | undefined;
  $defs?: Record<string, JSONSchema> | undefined;
  type?: "object" | "array" | "string" | "number" | "boolean" | "null" | "integer" | undefined;
  additionalItems?: _JSONSchema | undefined;
  unevaluatedItems?: _JSONSchema | undefined;
  prefixItems?: _JSONSchema[] | undefined;
  items?: _JSONSchema | _JSONSchema[] | undefined;
  contains?: _JSONSchema | undefined;
  additionalProperties?: _JSONSchema | undefined;
  unevaluatedProperties?: _JSONSchema | undefined;
  properties?: Record<string, _JSONSchema> | undefined;
  patternProperties?: Record<string, _JSONSchema> | undefined;
  dependentSchemas?: Record<string, _JSONSchema> | undefined;
  propertyNames?: _JSONSchema | undefined;
  if?: _JSONSchema | undefined;
  then?: _JSONSchema | undefined;
  else?: _JSONSchema | undefined;
  allOf?: JSONSchema[] | undefined;
  anyOf?: JSONSchema[] | undefined;
  oneOf?: JSONSchema[] | undefined;
  not?: _JSONSchema | undefined;
  multipleOf?: number | undefined;
  maximum?: number | undefined;
  exclusiveMaximum?: number | undefined;
  minimum?: number | undefined;
  exclusiveMinimum?: number | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  pattern?: string | undefined;
  maxItems?: number | undefined;
  minItems?: number | undefined;
  uniqueItems?: boolean | undefined;
  maxContains?: number | undefined;
  minContains?: number | undefined;
  maxProperties?: number | undefined;
  minProperties?: number | undefined;
  required?: string[] | undefined;
  dependentRequired?: Record<string, string[]> | undefined;
  enum?: Array<string | number | boolean | null> | undefined;
  const?: string | number | boolean | null | undefined;

  // metadata
  id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  default?: unknown | undefined;
  deprecated?: boolean | undefined;
  readOnly?: boolean | undefined;
  writeOnly?: boolean | undefined;
  examples?: unknown[] | undefined;
  format?: string | undefined;
  contentMediaType?: string | undefined;
  contentEncoding?: string | undefined;
  contentSchema?: JSONSchema | undefined;

  // internal
  _prefault?: unknown | undefined;
};

// for backwards compatibility
export type BaseSchema = JSONSchema;

export interface ObjectSchema extends JSONSchema {
  type: "object";
}

export interface ArraySchema extends JSONSchema {
  type: "array";
}

export interface StringSchema extends JSONSchema {
  type: "string";
}

export interface NumberSchema extends JSONSchema {
  type: "number";
}

export interface IntegerSchema extends JSONSchema {
  type: "integer";
}

export interface BooleanSchema extends JSONSchema {
  type: "boolean";
}

export interface NullSchema extends JSONSchema {
  type: "null";
}
