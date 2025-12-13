//////////////////////////////   AJV TYPES   ///////////////////////////////////////
// These types are derived from empirical testing with AJV 8.17.1

/** Minimal interface that AJV satisfies for JSON Schema validation. */
export interface $AjvLike {
  compile<T = unknown>(schema: object): $AjvValidateFunction<T>;
}

/** Compiled AJV validation function. */
export interface $AjvValidateFunction<T = unknown> {
  (data: unknown): data is T;
  errors?: $AjvError[] | null;
}

//////////////////////////////   AJV ERROR PARAMS   ///////////////////////////////////////

/** Type error: { type: "string" | "number" | "integer" | "boolean" | "array" | "object" | "null" } */
export interface $AjvTypeParams {
  type: string;
}

/** Number comparison: minimum, maximum, exclusiveMinimum, exclusiveMaximum */
export interface $AjvLimitNumberParams {
  limit: number;
  comparison: "<=" | ">=" | "<" | ">";
}

/** Limit: minLength, maxLength, minItems, maxItems, minProperties, maxProperties, additionalItems, unevaluatedItems */
export interface $AjvLimitParams {
  limit: number;
}

/** Required property missing */
export interface $AjvRequiredParams {
  missingProperty: string;
}

/** Pattern validation failed */
export interface $AjvPatternParams {
  pattern: string;
}

/** Format validation failed */
export interface $AjvFormatParams {
  format: string;
}

/** Enum validation failed */
export interface $AjvEnumParams {
  allowedValues: unknown[];
}

/** Const validation failed */
export interface $AjvConstParams {
  allowedValue: unknown;
}

/** MultipleOf validation failed */
export interface $AjvMultipleOfParams {
  multipleOf: number;
}

/** Additional property not allowed */
export interface $AjvAdditionalPropertiesParams {
  additionalProperty: string;
}

/** Duplicate items in array (i and j are indices) */
export interface $AjvUniqueItemsParams {
  i: number;
  j: number;
}

/** Contains constraint (minContains/maxContains) */
export interface $AjvContainsParams {
  minContains: number;
  maxContains?: number;
}

/** DependentRequired: property requires other properties */
export interface $AjvDependentRequiredParams {
  property: string;
  missingProperty: string;
  depsCount: number;
  deps: string;
}

/** PropertyNames validation failed */
export interface $AjvPropertyNamesParams {
  propertyName: string;
}

/** OneOf: passingSchemas is null if none match, [i, j] if multiple match */
export interface $AjvOneOfParams {
  passingSchemas: [number, number] | null;
}

/** If/then/else: failingKeyword is "then" or "else" */
export interface $AjvIfParams {
  failingKeyword: "then" | "else";
}

/** Unevaluated property not allowed */
export interface $AjvUnevaluatedPropertiesParams {
  unevaluatedProperty: string;
}

/** Empty params for anyOf, not, false schema */
export interface $AjvEmptyParams {}

/** AJV error object base structure */
export interface $AjvErrorObject<K extends string = string, P = Record<string, unknown>> {
  keyword: K;
  instancePath: string;
  schemaPath: string;
  params: P;
  message?: string;
  propertyName?: string;
}

/** Known AJV error keywords */
export type $AjvKnownError =
  | $AjvErrorObject<"type", $AjvTypeParams>
  | $AjvErrorObject<"minimum", $AjvLimitNumberParams>
  | $AjvErrorObject<"maximum", $AjvLimitNumberParams>
  | $AjvErrorObject<"exclusiveMinimum", $AjvLimitNumberParams>
  | $AjvErrorObject<"exclusiveMaximum", $AjvLimitNumberParams>
  | $AjvErrorObject<"minLength", $AjvLimitParams>
  | $AjvErrorObject<"maxLength", $AjvLimitParams>
  | $AjvErrorObject<"minItems", $AjvLimitParams>
  | $AjvErrorObject<"maxItems", $AjvLimitParams>
  | $AjvErrorObject<"minProperties", $AjvLimitParams>
  | $AjvErrorObject<"maxProperties", $AjvLimitParams>
  | $AjvErrorObject<"additionalItems", $AjvLimitParams>
  | $AjvErrorObject<"unevaluatedItems", $AjvLimitParams>
  | $AjvErrorObject<"required", $AjvRequiredParams>
  | $AjvErrorObject<"pattern", $AjvPatternParams>
  | $AjvErrorObject<"format", $AjvFormatParams>
  | $AjvErrorObject<"enum", $AjvEnumParams>
  | $AjvErrorObject<"const", $AjvConstParams>
  | $AjvErrorObject<"multipleOf", $AjvMultipleOfParams>
  | $AjvErrorObject<"additionalProperties", $AjvAdditionalPropertiesParams>
  | $AjvErrorObject<"uniqueItems", $AjvUniqueItemsParams>
  | $AjvErrorObject<"contains", $AjvContainsParams>
  | $AjvErrorObject<"dependentRequired", $AjvDependentRequiredParams>
  | $AjvErrorObject<"propertyNames", $AjvPropertyNamesParams>
  | $AjvErrorObject<"oneOf", $AjvOneOfParams>
  | $AjvErrorObject<"anyOf", $AjvEmptyParams>
  | $AjvErrorObject<"not", $AjvEmptyParams>
  | $AjvErrorObject<"if", $AjvIfParams>
  | $AjvErrorObject<"unevaluatedProperties", $AjvUnevaluatedPropertiesParams>
  | $AjvErrorObject<"false schema", $AjvEmptyParams>;

/** Type-safe AJV error - either a known error or an unknown keyword */
export type $AjvError = $AjvKnownError | $AjvErrorObject<string, Record<string, unknown>>;

/** Type guard for known AJV error keywords */
export function isKnownError(err: $AjvError): err is $AjvKnownError {
  return [
    "type",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
    "minProperties",
    "maxProperties",
    "additionalItems",
    "unevaluatedItems",
    "required",
    "pattern",
    "format",
    "enum",
    "const",
    "multipleOf",
    "additionalProperties",
    "uniqueItems",
    "contains",
    "dependentRequired",
    "propertyNames",
    "oneOf",
    "anyOf",
    "not",
    "if",
    "unevaluatedProperties",
    "false schema",
  ].includes(err.keyword);
}

//////////////////////////////   AJV IMPLEMENTATION   ///////////////////////////////////////

import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";

/** WeakMap cache for compiled JSON Schema validators */
export const compiledSchemas = /* @__PURE__*/ new WeakMap<object, $AjvValidateFunction>();

/**
 * Parse a JSON Pointer (RFC 6901) into a Zod path array.
 * Decodes ~1 -> / and ~0 -> ~ (order matters).
 */
export function parseJsonPointer(pointer: string): PropertyKey[] {
  if (!pointer) return [];
  // Remove leading slash, split by "/", decode each segment
  return pointer
    .slice(1)
    .split("/")
    .map((segment) => {
      const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");
      // Convert numeric strings to numbers for array indices
      const asNumber = Number(decoded);
      return Number.isInteger(asNumber) && asNumber >= 0 ? asNumber : decoded;
    });
}

/**
 * Map an AJV error to a Zod issue.
 * Maps AJV keywords to the closest Zod issue types.
 */
export function mapAjvErrorToIssue(
  err: $AjvError,
  input: unknown,
  inst: schemas.$ZodType,
  path: PropertyKey[]
): errors.$ZodRawIssue {
  // Use type assertion to get properly typed params based on keyword
  switch (err.keyword) {
    // Type errors
    case "type": {
      const params = err.params as $AjvTypeParams;
      return util.issue({
        code: "invalid_type",
        expected: params.type as schemas.$ZodType["_zod"]["def"]["type"],
        input,
        inst,
        path,
      } as errors.$ZodRawIssue);
    }

    // Number range errors
    case "minimum": {
      const params = err.params as $AjvLimitNumberParams;
      return util.issue({
        code: "too_small",
        origin: "number",
        minimum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    case "exclusiveMinimum": {
      const params = err.params as $AjvLimitNumberParams;
      return util.issue({
        code: "too_small",
        origin: "number",
        minimum: params.limit,
        inclusive: false,
        input,
        inst,
        path,
      });
    }

    case "maximum": {
      const params = err.params as $AjvLimitNumberParams;
      return util.issue({
        code: "too_big",
        origin: "number",
        maximum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    case "exclusiveMaximum": {
      const params = err.params as $AjvLimitNumberParams;
      return util.issue({
        code: "too_big",
        origin: "number",
        maximum: params.limit,
        inclusive: false,
        input,
        inst,
        path,
      });
    }

    // String length errors
    case "minLength": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_small",
        origin: "string",
        minimum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    case "maxLength": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_big",
        origin: "string",
        maximum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    // Array length errors
    case "minItems": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_small",
        origin: "array",
        minimum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    case "maxItems": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_big",
        origin: "array",
        maximum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    // Object property count errors
    case "minProperties": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_small",
        origin: "object",
        minimum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    case "maxProperties": {
      const params = err.params as $AjvLimitParams;
      return util.issue({
        code: "too_big",
        origin: "object",
        maximum: params.limit,
        inclusive: true,
        input,
        inst,
        path,
      });
    }

    // Pattern/format errors
    case "pattern": {
      const params = err.params as $AjvPatternParams;
      return util.issue({
        code: "invalid_format",
        format: "regex",
        pattern: params.pattern,
        input: input as string,
        inst,
        path,
      } as errors.$ZodRawIssue);
    }

    case "format": {
      const params = err.params as $AjvFormatParams;
      return util.issue({
        code: "invalid_format",
        format: params.format,
        input: input as string,
        inst,
        path,
      } as errors.$ZodRawIssue);
    }

    // Multiple of
    case "multipleOf": {
      const params = err.params as $AjvMultipleOfParams;
      return util.issue({
        code: "not_multiple_of",
        divisor: params.multipleOf,
        input: input as number | bigint,
        inst,
        path,
      } as errors.$ZodRawIssue);
    }

    // Enum/const errors
    case "enum": {
      const params = err.params as $AjvEnumParams;
      return util.issue({
        code: "invalid_value",
        values: params.allowedValues as util.Primitive[],
        input,
        inst,
        path,
      });
    }

    case "const": {
      const params = err.params as $AjvConstParams;
      return util.issue({
        code: "invalid_value",
        values: [params.allowedValue as util.Primitive],
        input,
        inst,
        path,
      });
    }

    // Additional properties
    case "additionalProperties": {
      const params = err.params as $AjvAdditionalPropertiesParams;
      return util.issue({
        code: "unrecognized_keys",
        keys: [params.additionalProperty],
        input: input as Record<string, unknown>,
        inst,
        path,
      } as errors.$ZodRawIssue);
    }

    // Required property missing - use invalid_type since the value is undefined
    case "required": {
      const params = err.params as $AjvRequiredParams;
      return util.issue({
        code: "invalid_type",
        expected: "nonoptional",
        input,
        inst,
        path: [...path, params.missingProperty],
      });
    }

    // Union errors
    case "anyOf":
    case "oneOf":
      return util.issue({
        code: "invalid_union",
        errors: [],
        input,
        inst,
        path,
      });

    // Unique items
    case "uniqueItems": {
      const params = err.params as $AjvUniqueItemsParams;
      return util.issue({
        code: "custom",
        message: err.message ?? "Array items must be unique",
        params: { i: params.i, j: params.j },
        input,
        inst,
        path,
      });
    }

    // Default: fall back to custom issue
    default:
      return util.issue({
        code: "custom",
        message: err.message ?? `JSON Schema validation failed: ${err.keyword}`,
        params: {
          ajvError: {
            keyword: err.keyword,
            schemaPath: err.schemaPath,
            params: err.params,
          },
        },
        input,
        inst,
        path,
      });
  }
}
