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
  OUTPUT,
  INPUT,
  $brand,
  function,
  clone,
  regexes,
  flattenError,
  formatError,
  treeifyError,
  prettyError,
} from "@zod/core";
