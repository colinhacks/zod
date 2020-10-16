import * as z from '../index';
import { AnyZodObject } from '../types/object';

export namespace partialUtil {
  export type RootDeepPartial<T extends z.ZodTypeAny> = {
    // optional: T extends z.ZodOptional<z.ZodTypeAny> ? T : z.ZodOptional<T>;
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends AnyZodObject
      ? z.ZodObject<
          { [k in keyof T['_shape']]: DeepPartial<T['_shape'][k]> },
          T['_unknownKeys'],
          T['_catchall']
        >
      : never;
    rest: ReturnType<T['optional']>; // z.ZodOptional<T>;
  }[T extends AnyZodObject
    ? 'object' // T extends z.ZodOptional<any> // ? 'optional' // :
    : 'rest'];

  export type DeepPartial<T extends z.ZodTypeAny> = {
    // optional: T extends z.ZodOptional<z.ZodTypeAny> ? T : z.ZodOptional<T>;
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<infer Shape, infer Params, infer Catchall>
      ? z.ZodOptional<
          z.ZodObject<
            { [k in keyof Shape]: DeepPartial<Shape[k]> },
            Params,
            Catchall
          >
        >
      : never;
    rest: ReturnType<T['optional']>;
  }[T extends z.ZodObject<any>
    ? 'object' // T extends z.ZodOptional<any> // ? 'optional' // :
    : 'rest'];
}
