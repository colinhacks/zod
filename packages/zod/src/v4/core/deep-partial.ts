import type * as schemas from "./schemas.js";
import { visit } from "./visit.js";

/**
 * Shared runtime implementation for `zod/deepPartial` and
 * `zod/mini/deepPartial`. Walks the schema tree via {@link visit} and
 * rewrites every `ZodObject` into its `.partial()` form.
 *
 * `ZodDiscriminatedUnion` is degraded to a plain union over already-
 * partialed options: making the discriminator optional collapses the
 * fast-path lookup (every option gets `undefined` as a possible
 * discriminator), so we fall back to try-each semantics.
 *
 * Both the object-partialer and union-constructor are injected so the
 * two flavors (classic / mini) can supply their own concrete types.
 */
export function deepPartialImpl<T extends schemas.SomeType>(
  schema: T,
  partialObject: (s: schemas.$ZodType) => schemas.$ZodType,
  makeUnion: (options: schemas.$ZodType[]) => schemas.$ZodType
): T {
  return visit(schema, {
    object: (s) => partialObject(s),
    union: (s) => {
      const def = s._zod.def as unknown as { discriminator?: string; options: schemas.$ZodType[] };
      return def.discriminator !== undefined ? makeUnion(def.options) : s;
    },
  });
}
