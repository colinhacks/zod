import * as core from "../core/index.js";
import type * as schemas from "./schemas.js";

// Aliased here rather than re-exported from the barrel: `export type { X } from A` plus
// `export { X } from B` collides as a duplicate identifier, so co-locating the type and the
// value is the only way they can share a name.
export type input<T> = core.input<T>;
export type output<T> = core.output<T>;

/** Returns a copy of the schema with every pipe replaced by its input side. */
export function input<T extends core.$ZodType>(schema: T): schemas.ZodType<core.input<T>, core.input<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).in as core.$ZodType,
  }) as any;
}

/** Returns a copy of the schema with every pipe replaced by its output side. */
export function output<T extends core.$ZodType>(schema: T): schemas.ZodType<core.output<T>, core.output<T>> {
  return core.visit(schema, {
    pipe: (s) => (s._zod.def as any).out as core.$ZodType,
  }) as any;
}
