export * as core from "@zod/core";
export * from "./parse.js";
export * from "./schemas.js";
export * from "./checks.js";

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

/** A special constant with type `never` */
// export const NEVER = {} as never;
