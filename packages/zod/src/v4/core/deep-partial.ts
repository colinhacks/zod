import type * as schemas from "./schemas.js";
import { visit } from "./visit.js";

/** Rewrites every object in the schema tree into its partial form. */
// `partialObject` and `makeUnion` are injected so classic and mini can each supply their own
// concrete constructors over the shared traversal.
export function deepPartialImpl<T extends schemas.SomeType>(
  schema: T,
  partialObject: (s: schemas.$ZodType) => schemas.$ZodType,
  makeUnion: (options: schemas.$ZodType[]) => schemas.$ZodType
): T {
  return visit(schema, {
    object: (s) => partialObject(s),
    union: (s) => {
      const def = s._zod.def as unknown as { discriminator?: string; options: schemas.$ZodType[] };
      // An optional discriminator makes `undefined` a possible value for every option, which
      // collapses the discriminated fast-path lookup. Degrade to try-each union semantics.
      return def.discriminator !== undefined ? makeUnion(def.options) : s;
    },
  });
}
