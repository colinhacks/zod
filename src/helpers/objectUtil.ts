import type { ZodTypeAny } from "../types";

export type optionalKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];
export type requiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];
export type addQuestionMarks<T extends object, _O = any> = {
  [K in requiredKeys<T>]: T[K];
} & {
  [K in optionalKeys<T>]?: T[K];
} & { [k in keyof T]?: unknown };

export type identity<T> = T;
export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

export type noNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type noNever<T> = identity<{
  [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export const mergeShapes = <U, T>(first: U, second: T): T & U => {
  return {
    ...first,
    ...second, // second overwrites first
  };
};

export type extendShape<A extends object, B extends object> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};
// if Augmentation[k] is a string, rename the key in T to that string
// otherwise overwrite the key in T with the value in Augmentation
export type remap<T, Augmentation extends { [k in keyof T]?: unknown }> = {
  [k in keyof T as Augmentation[k] extends string
    ? Augmentation[k]
    : k]: Augmentation[k] extends string
    ? T[k]
    : Augmentation[k] extends ZodTypeAny
    ? Augmentation[k]
    : T[k];
};
