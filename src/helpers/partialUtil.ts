import * as z from '../index';

export namespace partialUtil {
  export type RootDeepPartial<T extends z.ZodTypeAny> = {
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<infer Shape, infer UnknownKeys>
      ? z.ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }, UnknownKeys>
      : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
  }[T extends z.ZodObject<any> ? 'object' : 'rest'];

  export type DeepPartial<T extends z.ZodTypeAny> = {
    // array: T extends z.ZodArray<infer Type> ? z.ZodArray<DeepPartial<Type>> : never;
    object: T extends z.ZodObject<infer Shape, infer UnknownKeys>
      ? z.ZodUnion<
          [
            z.ZodObject<
              { [k in keyof Shape]: DeepPartial<Shape[k]> },
              UnknownKeys
            >,
            z.ZodUndefined,
          ]
        >
      : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
  }[T extends z.ZodObject<any> ? 'object' : 'rest'];
}
