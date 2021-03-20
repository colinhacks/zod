import { ZodObject, ZodOptional, ZodTypeAny } from '../index';

type AnyZodObject = ZodObject<any, any, any>;

export namespace partialUtil {
  export type RootDeepPartial<T extends ZodTypeAny> = {
    // optional: T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;
    // array: T extends ZodArray<infer Type> ? ZodArray<DeepPartial<Type>> : never;
    object: T extends AnyZodObject
      ? ZodObject<
          { [k in keyof T['_shape']]: DeepPartial<T['_shape'][k]> },
          T['_unknownKeys'],
          T['_catchall']
        >
      : never;
    rest: ReturnType<T['optional']>; // ZodOptional<T>;
  }[T extends AnyZodObject
    ? 'object' // T extends ZodOptional<any> // ? 'optional' // :
    : 'rest'];

  export type DeepPartial<T extends ZodTypeAny> = {
    // optional: T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;
    // array: T extends ZodArray<infer Type> ? ZodArray<DeepPartial<Type>> : never;
    object: T extends ZodObject<infer Shape, infer Params, infer Catchall>
      ? ZodOptional<
          ZodObject<
            { [k in keyof Shape]: DeepPartial<Shape[k]> },
            Params,
            Catchall
          >
        >
      : never;
    rest: ReturnType<T['optional']>;
  }[T extends ZodObject<any>
    ? 'object' // T extends ZodOptional<any> // ? 'optional' // :
    : 'rest'];
}
