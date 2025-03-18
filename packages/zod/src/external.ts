import * as core from "@zod/core";
export * from "./schemas.js";
export * from "./api.js";
export * from "./errors.js";
export * from "./compat.js";

// use English locale by default
import en from "@zod/core/locales/en.js";
core.config(en());

export type { infer, output, input } from "@zod/core";
export { globalRegistry, registry, config, OUTPUT, INPUT, $brand, function, clone } from "@zod/core";
