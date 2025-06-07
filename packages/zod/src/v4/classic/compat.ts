// Zod 3 compat layer

import * as core from "zod/v4/core";
import type { ZodType } from "./schemas.js";

export type {
  /** @deprecated Use `z.output<T>` instead. */
  output as TypeOf,
  /** @deprecated Use `z.output<T>` instead. */
  output as Infer,
  /** @deprecated Use `z.core.$$ZodFirstPartyTypes` instead */
  $ZodTypes as ZodFirstPartySchemaTypes,
} from "zod/v4/core";

/** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */
export const ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom",
} as const;

/** @deprecated Not necessary in Zod 4. */
type INVALID = { status: "aborted" };
/** @deprecated Not necessary in Zod 4. */
const INVALID: INVALID = Object.freeze({
  status: "aborted",
});

/** A special constant with type `never` */
export const NEVER = INVALID as never;

/** @deprecated Use `z.$ZodFlattenedError` */
export type inferFlattenedErrors<T extends core.$ZodType, U = string> = core.$ZodFlattenedError<core.output<T>, U>;

/** @deprecated Use `z.$ZodFormattedError` */
export type inferFormattedError<T extends core.$ZodType<any, any>, U = string> = core.$ZodFormattedError<
  core.output<T>,
  U
>;

/** Use `z.$brand` instead */
export type BRAND<T extends string | number | symbol = string | number | symbol> = {
  [core.$brand]: { [k in T]: true };
};
export { $brand, config } from "zod/v4/core";

/** @deprecated Use `z.config(params)` instead. */
export function setErrorMap(map: core.$ZodErrorMap): void {
  core.config({
    customError: map,
  });
}

/** @deprecated Use `z.config()` instead. */
export function getErrorMap(): core.$ZodErrorMap<core.$ZodIssue> | undefined {
  return core.config().customError;
}

export type {
  /** @deprecated Use z.ZodType (without generics) instead. */
  ZodType as ZodTypeAny,
  /** @deprecated Use `z.ZodType` */
  ZodType as ZodSchema,
  /** @deprecated Use `z.ZodType` */
  ZodType as Schema,
};

export type ZodRawShape = core.$ZodShape;
