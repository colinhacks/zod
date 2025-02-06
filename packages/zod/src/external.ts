export * from "./schemas.js";
export * from "./api.js";

export type { infer, output, input } from "zod-core";
export type { output as TypeOf, output as Infer } from "zod-core";
export {
  registry,
  // namedRegistry,
  globalRegistry,
} from "zod-core";

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

type INVALID = { status: "aborted" };
const INVALID: INVALID = Object.freeze({
  status: "aborted",
});

/** @deprecated No necessary  */
export const NEVER = INVALID as never;
