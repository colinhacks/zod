import { ZodRawShape } from './types/base';

export type Merge<U extends object, V extends object> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} &
  V;

export type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} &
  V;

export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;
