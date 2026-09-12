import type * as core from "../core/index.js";
import { visit } from "../core/visit.js";
import * as schemas from "./schemas.js";

/** Distributes `.partial()` through every object in a schema type, preserving the wrappers around them. */
// biome-ignore format: preserve vertical layout for readability.
export type DeepPartial<T extends core.SomeType> =
  T extends schemas.ZodObject<infer Shape, infer Config>
    ? schemas.ZodObject<
        { -readonly [K in keyof Shape]: schemas.ZodOptional<DeepPartial<Shape[K]>> },
        Config
      >
  // Must precede ZodUnion; degrades to it, matching the runtime.
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
  : T extends schemas.ZodSuccess<infer Inner>
    ? schemas.ZodSuccess<DeepPartial<Inner>>
  : T extends schemas.ZodPromise<infer Inner>
    ? schemas.ZodPromise<DeepPartial<Inner>>
  // Must precede ZodPipe, which both extend structurally, or the subtype is lost.
  : T extends schemas.ZodCodec<infer A, infer B>
    ? schemas.ZodCodec<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodPreprocess<infer B>
    ? schemas.ZodPreprocess<DeepPartial<B>>
  : T extends schemas.ZodPipe<infer A, infer B>
    ? schemas.ZodPipe<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodLazy<infer Inner>
    ? schemas.ZodLazy<DeepPartial<Inner>>
  : T;

/** Returns a copy of the schema with every nested object's properties made optional. */
export function deepPartial<T extends core.SomeType>(schema: T): DeepPartial<T> {
  return visit(schema, {
    object: (s) => (s as schemas.ZodObject).partial(),
    // Every partialed option now admits `undefined`, which the constructor rejects as a duplicate.
    union: (s) => {
      const def = s._zod.def as core.$ZodDiscriminatedUnionDef;
      return def.discriminator === undefined ? s : schemas.union(def.options as schemas.ZodType[]);
    },
  }) as unknown as DeepPartial<T>;
}
