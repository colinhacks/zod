import type { ZodType } from "./ZodType.js";

export type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
export type InputOf<T extends ZodType<any, any, any>> = T["_input"];
export type { ZodType };