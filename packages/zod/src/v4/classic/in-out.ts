import * as core from "../core/index.js";
import type * as schemas from "./schemas.js";

// Local aliases for the type-level helpers so the runtime `input` /
// `output` exports can share the same name with them. TS tracks types
// and values in separate namespaces within a module, but a `export type
// { X } from A` + `export { X } from B` pair at a barrel collides as a
// duplicate identifier, so co-location is the only re-export path that
// works.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/**
 * Runtime counterpart to `z.input<T>`: returns a schema where every
 * `pipe`/codec node is replaced by its input side, describing the
 * shape that goes *into* the original schema's parse/decode pipeline.
 */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodType<core.input<T>, core.input<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).in as core.$ZodType,
  }) as any;
}

/**
 * Runtime counterpart to `z.output<T>`: returns a schema where every
 * `pipe`/codec node is replaced by its output side, describing the
 * shape that comes *out* of the original schema's parse/decode
 * pipeline.
 */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodType<core.output<T>, core.output<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).out as core.$ZodType,
  }) as any;
}
