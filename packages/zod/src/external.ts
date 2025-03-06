import * as core from "@zod/core";
export * from "./schemas.js";
export * from "./api.js";
export * from "./errors.js";
export * from "./compat.js";
export * from "./function.js";
export type { infer, output, input } from "@zod/core";
export * from "./registries.js";

// use English locale by default
import en from "@zod/core/locales/en.js";
core.config(en());
