import * as z from '../index';
import { AnyZodObject } from '../types/object';

export namespace partialUtil {
  export type RootDeepPartial<T extends z.ZodTypeAny> = {
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends AnyZodObject
      ? z.ZodObject<
          { [k in keyof T['_shape']]: DeepPartial<T['_shape'][k]> },
          T['_unknownKeys'],
          T['_catchall']
        >
      : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
  }[T extends AnyZodObject ? 'object' : 'rest'];

  export type DeepPartial<T extends z.ZodTypeAny> = {
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<
      infer Shape,
      infer UnknownKeys,
      infer Catchall
    >
      ? z.ZodUnion<
          [
            z.ZodObject<
              { [k in keyof Shape]: DeepPartial<Shape[k]> },
              UnknownKeys,
              Catchall
            >,
            z.ZodUndefined,
          ]
        >
      : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
  }[T extends z.ZodObject<any, any, any> ? 'object' : 'rest'];
}
