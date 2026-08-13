export * as core from "../core/index.js";
export * from "./schemas.js";
export * from "./checks.js";
export * from "./errors.js";
export * from "./parse.js";
export * from "./compat.js";

// `output` / `input` are NOT re-exported here: the runtime `z.input` / `z.output` live in
// `./in-out.js`, and a type re-export from core plus a value export from there collide as a
// duplicate identifier. The type aliases are co-located with the functions instead.
export type { infer } from "../core/index.js";
export type { JSONType } from "../core/util.js";
export {
  globalRegistry,
  type GlobalMeta,
  registry,
  config,
  $output,
  $input,
  $brand,
  clone,
  regexes,
  treeifyError,
  prettifyError,
  formatError,
  flattenError,
  TimePrecision,
  util,
  NEVER,
} from "../core/index.js";
export { toJSONSchema } from "../core/json-schema-processors.js";
export { fromJSONSchema } from "./from-json-schema.js";
export { deepPartial } from "./deep-partial.js";
// `z.input` and `z.output` are the runtime counterparts to the
// type-level `z.input<T>` / `z.output<T>`. Types and values share the
// same name cleanly since they live in separate TS namespaces.
export { input, output } from "./in-out.js";

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
