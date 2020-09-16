import * as z from '../index';

export namespace partialUtil {
  export type RootDeepPartial<T extends z.ZodTypeAny> = {
    optional: T extends z.ZodOptional<z.ZodTypeAny> ? T : z.ZodOptional<T>;
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<infer Shape, infer Params>
      ? z.ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }, Params>
      : never;
    rest: z.ZodOptional<T>;
  }[T extends z.ZodObject<any>
    ? 'object'
    : T extends z.ZodOptional<any>
    ? 'optional'
    : 'rest'];

  export type DeepPartial<T extends z.ZodTypeAny> = {
    optional: T extends z.ZodOptional<z.ZodTypeAny> ? T : z.ZodOptional<T>;
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<infer Shape, infer Params>
      ? z.ZodOptional<
          z.ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }, Params>
        >
      : never;
    rest: z.ZodOptional<T>;
  }[T extends z.ZodObject<any>
    ? 'object'
    : T extends z.ZodOptional<any>
    ? 'optional'
    : 'rest'];
}
