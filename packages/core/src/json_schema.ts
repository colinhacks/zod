export type Schema =
  | boolean
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | BooleanSchema
  | NullSchema;

export interface BaseSchema {
  $id?: string;
  $schema?: string;
  $ref?: string;
  $anchor?: string;
  $defs?: { [key: string]: Schema };
  $comment?: string;
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  allOf?: Schema[];
  anyOf?: Schema[];
  oneOf?: Schema[];
  not?: Schema;
  if?: Schema;
  then?: Schema;
  else?: Schema;
}

export interface ObjectSchema extends BaseSchema {
  type: "object";
  properties?: { [key: string]: Schema };
  patternProperties?: { [key: string]: Schema };
  additionalProperties?: Schema | boolean;
  required?: string[];
  dependentRequired?: { [key: string]: string[] };
  propertyNames?: Schema;
  minProperties?: number;
  maxProperties?: number;
  unevaluatedProperties?: Schema | boolean;
  dependentSchemas?: { [key: string]: Schema };
}

export interface ArraySchema extends BaseSchema {
  type: "array";
  items?: Schema;
  prefixItems?: Schema[];
  // additionalItems?: Schema | boolean; (deprecated)
  contains?: Schema;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: boolean;
  unevaluatedItems?: Schema | boolean;
}

export interface StringSchema extends BaseSchema {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  contentEncoding?: string;
  contentMediaType?: string;
}

export interface NumberSchema extends BaseSchema {
  type: "number";
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export interface IntegerSchema extends BaseSchema {
  type: "integer";
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export interface BooleanSchema extends BaseSchema {
  type: "boolean";
}

export interface NullSchema extends BaseSchema {
  type: "null";
}
