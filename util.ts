import { ZodRawShape } from './types/base';

// import { ZodRawShape } from '.';

export type Merge<U extends object, V extends object> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} &
  V;

export type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} &
  V;
