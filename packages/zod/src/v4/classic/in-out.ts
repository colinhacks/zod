import * as core from "../core/index.js";
import type * as schemas from "./schemas.js";

/**
 * Returns a schema where every `pipe`/codec node is replaced by its
 * input side. The result describes the shape that goes *into* the
 * original schema's parse/decode pipeline.
 */
export function inOf<T extends core.$ZodType>(schema: T): schemas.ZodType<core.input<T>, core.input<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).in as core.$ZodType,
  }) as any;
}

/**
 * Returns a schema where every `pipe`/codec node is replaced by its
 * output side. The result describes the shape that comes *out* of the
 * original schema's parse/decode pipeline.
 */
export function outOf<T extends core.$ZodType>(schema: T): schemas.ZodType<core.output<T>, core.output<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).out as core.$ZodType,
  }) as any;
}
