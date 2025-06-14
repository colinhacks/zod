export * as core from "zod/v4/core";
export * from "./schemas.js";
export * from "./checks.js";
export * from "./errors.js";
export * from "./parse.js";
export * from "./compat.js";

// zod-specified
import { config } from "zod/v4/core";
import en from "zod/v4/locales/en.js";
config(en());

export type { infer, output, input } from "zod/v4/core";
export {
  globalRegistry,
  type GlobalMeta,
  registry,
  config,
  function,
  $output,
  $input,
  $brand,
  clone,
  regexes,
  treeifyError,
  prettifyError,
  formatError,
  flattenError,
  toJSONSchema,
  TimePrecision,
} from "zod/v4/core";

export * as locales from "../locales/index.js";

// iso
// must be exported from top-level
// https://github.com/colinhacks/zod/issues/4491
export { ZodISODateTime, ZodISODate, ZodISOTime, ZodISODuration } from "./iso.js";
export * as iso from "./iso.js";

// coerce
export type {
  ZodCoercedString,
  ZodCoercedNumber,
  ZodCoercedBigInt,
  ZodCoercedBoolean,
  ZodCoercedDate,
} from "./coerce.js";
export * as coerce from "./coerce.js";
