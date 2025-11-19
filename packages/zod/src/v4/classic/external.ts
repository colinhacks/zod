export * as core from "../core/index.js";
export * from "./schemas.js";
export * from "./checks.js";
export * from "./errors.js";
export * from "./parse.js";
export * from "./compat.js";

// Auto-configure English locale (most common case)
// Other 46 locales are tree-shakeable via named exports
import { config } from "../core/index.js";
import en from "../locales/en.js";
config(en());

export type { infer, output, input } from "../core/index.js";
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
  toJSONSchema,
  TimePrecision,
  util,
  NEVER,
} from "../core/index.js";

// Locales exported individually to enable tree-shaking
// Bundlers will only include the locales you actually use
export {
  en,
  ar,
  az,
  be,
  bg,
  ca,
  cs,
  da,
  de,
  eo,
  es,
  fa,
  fi,
  fr,
  frCA,
  he,
  hu,
  id,
  is,
  it,
  ja,
  ka,
  kh,
  km,
  ko,
  lt,
  mk,
  ms,
  nl,
  no,
  ota,
  pl,
  ps,
  pt,
  ru,
  sl,
  sv,
  ta,
  th,
  tr,
  ua,
  uk,
  ur,
  vi,
  yo,
  zhCN,
  zhTW,
} from "../locales/index.js";

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
