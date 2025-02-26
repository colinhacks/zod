// Zod 3 compat layer

import * as core from "@zod/core";

export * as core from "@zod/core";
export type {
  /** @deprecated Use `z.output<T>` instead. */
  output as TypeOf,
  /** @deprecated Use `z.output<T>` instead. */
  output as Infer,
  /** @deprecated Use `z.core.$ZodFirstPartySchemaTypes` instead */
  $ZodFirstPartySchemaTypes as ZodFirstPartySchemaTypes,
} from "@zod/core";

/** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */
export const ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  invalid_date: "invalid_date",
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

/** @deprecated Not necessary in Zod 4. */
export const NEVER = INVALID as never;

/** @deprecated Use `z.$ZodFlattenedError` */
export type inferFlattenedErrors<T extends core.$ZodType, U = string> = core.$ZodFlattenedError<core.output<T>, U>;

/** @deprecated Use `z.$ZodFormattedError` */
export type inferFormattedError<T extends core.$ZodType<any, any>, U = string> = core.$ZodFormattedError<
  core.output<T>,
  U
>;

export type BRAND<T extends string | number | symbol = string | number | symbol> = {
  [core.BRAND]: { [k in T]: true };
};
export { BRAND, config } from "@zod/core";

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

export { parse, safeParse, parseAsync, safeParseAsync } from "@zod/core";

export { json, stringbool } from "@zod/core";
