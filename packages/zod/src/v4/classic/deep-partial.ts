import * as core from "../core/index.js";
import * as schemas from "./schemas.js";

/**
 * Recursive schema transform: walks the input schema tree and rebuilds
 * it with every `ZodObject` shape made optional at every level. Leaves
 * and unrecognized subtypes are preserved as-is.
 */
// biome-ignore format: preserve vertical layout for readability.
export type DeepPartial<T extends core.SomeType> =
  T extends schemas.ZodObject<infer Shape, infer Config>
    ? schemas.ZodObject<
        { -readonly [K in keyof Shape]: schemas.ZodOptional<DeepPartial<Shape[K]>> },
        Config
      >
  : T extends schemas.ZodDiscriminatedUnion<infer Options, any>
    ? schemas.ZodUnion<
        { -readonly [I in keyof Options]: Options[I] extends core.SomeType ? DeepPartial<Options[I]> : Options[I] }
      >
  : T extends schemas.ZodUnion<infer Options>
    ? schemas.ZodUnion<
        { -readonly [I in keyof Options]: Options[I] extends core.SomeType ? DeepPartial<Options[I]> : Options[I] }
      >
  : T extends schemas.ZodArray<infer El>
    ? schemas.ZodArray<DeepPartial<El>>
  : T extends schemas.ZodTuple<infer Items, infer Rest>
    ? schemas.ZodTuple<
        { -readonly [K in keyof Items]: Items[K] extends core.SomeType ? DeepPartial<Items[K]> : Items[K] },
        Rest extends core.SomeType ? DeepPartial<Rest> : Rest
      >
  : T extends schemas.ZodIntersection<infer A, infer B>
    ? schemas.ZodIntersection<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodRecord<infer K, infer V>
    ? schemas.ZodRecord<K, DeepPartial<V>>
  : T extends schemas.ZodMap<infer K, infer V>
    ? schemas.ZodMap<K, DeepPartial<V>>
  : T extends schemas.ZodSet<infer El>
    ? schemas.ZodSet<DeepPartial<El>>
  : T extends schemas.ZodOptional<infer Inner>
    ? schemas.ZodOptional<DeepPartial<Inner>>
  : T extends schemas.ZodNullable<infer Inner>
    ? schemas.ZodNullable<DeepPartial<Inner>>
  : T extends schemas.ZodDefault<infer Inner>
    ? schemas.ZodDefault<DeepPartial<Inner>>
  : T extends schemas.ZodPrefault<infer Inner>
    ? schemas.ZodPrefault<DeepPartial<Inner>>
  : T extends schemas.ZodNonOptional<infer Inner>
    ? schemas.ZodNonOptional<DeepPartial<Inner>>
  : T extends schemas.ZodCatch<infer Inner>
    ? schemas.ZodCatch<DeepPartial<Inner>>
  : T extends schemas.ZodReadonly<infer Inner>
    ? schemas.ZodReadonly<DeepPartial<Inner>>
  : T extends schemas.ZodPipe<infer A, infer B>
    ? schemas.ZodPipe<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodLazy<infer Inner>
    ? schemas.ZodLazy<DeepPartial<Inner>>
  : T;

/**
 * Returns a schema where every nested object's properties are made
 * optional, recursively. Built on {@link core.visit}; terminates on
 * lazy cycles and visits shared sub-schemas once. Non-object nodes
 * are left untouched.
 */
export function deepPartial<T extends core.SomeType>(schema: T): DeepPartial<T> {
  return core.visit(schema, {
    object: (s) => (s as schemas.ZodObject).partial(),
    // Making a discriminator optional collapses the fast-path lookup
    // (every option gets `undefined` as a possible discriminator).
    // Degrade to a plain union over the already-partialed options —
    // validation semantics are preserved via try-each.
    union: (s) => {
      const def = s._zod.def as any;
      return def.discriminator !== undefined ? schemas.union(def.options) : s;
    },
  }) as any;
}
