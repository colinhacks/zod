/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from '..';
import { ZodTypeAny } from '../types/base';

export type RootDeepPartial<T extends ZodTypeAny> = {
  // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
  object: T extends z.ZodObject<infer Shape, infer Params>
    ? z.ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }, Params>
    : never;
  rest: z.ZodUnion<[T, z.ZodUndefined]>;
}[T extends z.ZodObject<any> ? 'object' : 'rest'];

export type DeepPartial<T extends ZodTypeAny> = {
  // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
  object: T extends z.ZodObject<infer Shape, infer Params>
    ? z.ZodUnion<[z.ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }, Params>, z.ZodUndefined]>
    : never;
  rest: z.ZodUnion<[T, z.ZodUndefined]>;
}[T extends z.ZodObject<any> ? 'object' : 'rest'];
