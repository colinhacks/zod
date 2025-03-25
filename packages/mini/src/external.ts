export * as core from "@zod/core";
export * from "./parse.js";
export * from "./schemas.js";
export * from "./checks.js";

export type { infer, output, input } from "@zod/core";
export { globalRegistry, registry, config, OUTPUT, INPUT, $brand, function, clone, regexes } from "@zod/core";

/** A special constant with type `never` */
export const NEVER = {} as never;
