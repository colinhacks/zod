import type { z } from "../src/index.js";

type Tagged = z.ZodType & { _tag: string };
function transformer<Out extends z.ZodType>(tx: (arg: Tagged) => Out) {
  return tx;
}

type Replacer<
  Tx extends (arg: Tagged) => z.ZodType,
  Input extends z.ZodType,
> = replaceTagged<ReturnType<Tx>, Input>;

type replaceTagged<
  T extends z.ZodType,
  With extends z.ZodType,
> = T extends Tagged
  ? With
  : T extends z.ZodOptional<infer U>
    ? z.ZodOptional<replaceTagged<U, With>>
    : T extends z.ZodNullable<infer U>
      ? z.ZodNullable<replaceTagged<U, With>>
      : T extends z.ZodEffects<infer U, infer E>
        ? z.ZodEffects<replaceTagged<U, With>, E>
        : T extends z.ZodPromise<infer U>
          ? z.ZodPromise<replaceTagged<U, With>>
          : T extends z.ZodArray<infer U>
            ? z.ZodArray<replaceTagged<U, With>>
            : T extends z.ZodObject<infer U>
              ? z.ZodObject<{ [k in keyof U]: replaceTagged<U[k], With> }>
              : T extends z.ZodUnion<infer U>
                ? z.ZodUnion<{
                    [k in keyof U]: replaceTagged<U[k], With>;
                  }>
                : T extends z.ZodIntersection<infer U, infer T>
                  ? z.ZodIntersection<
                      replaceTagged<U, With>,
                      replaceTagged<T, With>
                    >
                  : T extends z.ZodTuple<infer U>
                    ? {
                        [k in keyof U]: replaceTagged<U[k], With>;
                      } extends infer Items extends [
                        z.ZodTypeAny,
                        ...z.ZodTypeAny[],
                      ]
                      ? z.ZodTuple<Items>
                      : never
                    : T extends z.ZodRecord<infer K, infer V>
                      ? z.ZodRecord<K, replaceTagged<V, With>>
                      : T extends z.ZodMap<infer V>
                        ? z.ZodMap<replaceTagged<V, With>>
                        : T extends z.ZodSet<infer V>
                          ? z.ZodSet<replaceTagged<V, With>>
                          : //  T extends z.ZodFunction<infer I, infer O>
                            // ? // z.ZodFunction<replaceTagged<I, With>, replaceTagged<O, With>>
                            // :
                            T extends z.ZodLazy<infer U>
                            ? z.ZodLazy<replaceTagged<U, With>>
                            : T;

const tx1 = transformer((arg) => arg.optional().nullable().array());
export type out1 = Replacer<typeof tx1, z.ZodString>;
