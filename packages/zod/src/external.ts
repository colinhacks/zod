export * as core from "@zod/core";
export * from "./schemas.js";
export * from "./checks.js";
export * from "./errors.js";
export * from "./parse.js";
export * from "./compat.js";

// zod-specified
import { config } from "@zod/core";
import en from "@zod/core/locales/en.js";
config(en());

export type { infer, output, input } from "@zod/core";
export {
  globalRegistry,
  registry,
  config,
  $output,
  $input,
  $brand,
  function,
  clone,
  regexes,
  // flattenError,
  // formatError,
  treeifyError,
  prettifyError,
  toJSONSchema,
  locales,
} from "@zod/core";
