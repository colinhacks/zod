import * as core from "../core/index.js";
import * as schemas from "./schemas.js";

/** Mini counterpart of `classic/deep-partial.ts`'s `DeepPartial`. */
// biome-ignore format: preserve vertical layout for readability.
export type DeepPartial<T extends core.SomeType> =
  T extends schemas.ZodMiniObject<infer Shape, infer Config>
    ? schemas.ZodMiniObject<
        { -readonly [K in keyof Shape]: schemas.ZodMiniOptional<DeepPartial<Shape[K]>> },
        Config
      >
  : T extends schemas.ZodMiniDiscriminatedUnion<infer Options, any>
    ? schemas.ZodMiniUnion<
        { -readonly [I in keyof Options]: Options[I] extends core.SomeType ? DeepPartial<Options[I]> : Options[I] }
      >
  : T extends schemas.ZodMiniUnion<infer Options>
    ? schemas.ZodMiniUnion<
        { -readonly [I in keyof Options]: Options[I] extends core.SomeType ? DeepPartial<Options[I]> : Options[I] }
      >
  : T extends schemas.ZodMiniArray<infer El>
    ? schemas.ZodMiniArray<DeepPartial<El>>
  : T extends schemas.ZodMiniTuple<infer Items, infer Rest>
    ? schemas.ZodMiniTuple<
        { -readonly [K in keyof Items]: Items[K] extends core.SomeType ? DeepPartial<Items[K]> : Items[K] },
        Rest extends core.SomeType ? DeepPartial<Rest> : Rest
      >
  : T extends schemas.ZodMiniIntersection<infer A, infer B>
    ? schemas.ZodMiniIntersection<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodMiniRecord<infer K, infer V>
    ? schemas.ZodMiniRecord<K, DeepPartial<V>>
  : T extends schemas.ZodMiniMap<infer K, infer V>
    ? schemas.ZodMiniMap<K, DeepPartial<V>>
  : T extends schemas.ZodMiniSet<infer El>
    ? schemas.ZodMiniSet<DeepPartial<El>>
  : T extends schemas.ZodMiniOptional<infer Inner>
    ? schemas.ZodMiniOptional<DeepPartial<Inner>>
  : T extends schemas.ZodMiniNullable<infer Inner>
    ? schemas.ZodMiniNullable<DeepPartial<Inner>>
  : T extends schemas.ZodMiniDefault<infer Inner>
    ? schemas.ZodMiniDefault<DeepPartial<Inner>>
  : T extends schemas.ZodMiniPrefault<infer Inner>
    ? schemas.ZodMiniPrefault<DeepPartial<Inner>>
  : T extends schemas.ZodMiniNonOptional<infer Inner>
    ? schemas.ZodMiniNonOptional<DeepPartial<Inner>>
  : T extends schemas.ZodMiniCatch<infer Inner>
    ? schemas.ZodMiniCatch<DeepPartial<Inner>>
  : T extends schemas.ZodMiniReadonly<infer Inner>
    ? schemas.ZodMiniReadonly<DeepPartial<Inner>>
  : T extends schemas.ZodMiniSuccess<infer Inner>
    ? schemas.ZodMiniSuccess<DeepPartial<Inner>>
  : T extends schemas.ZodMiniPromise<infer Inner>
    ? schemas.ZodMiniPromise<DeepPartial<Inner>>
  : T extends schemas.ZodMiniCodec<infer A, infer B>
    ? schemas.ZodMiniCodec<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodMiniPipe<infer A, infer B>
    ? schemas.ZodMiniPipe<DeepPartial<A>, DeepPartial<B>>
  : T extends schemas.ZodMiniLazy<infer Inner>
    ? schemas.ZodMiniLazy<DeepPartial<Inner>>
  : T;

/** See `classic/deep-partial.ts`. Mini variant uses `mini.partial(...)`. */
export function deepPartial<T extends core.SomeType>(schema: T): DeepPartial<T> {
  return core.deepPartialImpl(
    schema,
    (s) => schemas.partial(s as schemas.ZodMiniObject) as core.$ZodType,
    (opts) => schemas.union(opts as schemas.ZodMiniType[]) as core.$ZodType
  ) as unknown as DeepPartial<T>;
}
