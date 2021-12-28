import type {
  ZodArray,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodTuple,
  ZodTupleItems,
  ZodTypeAny,
} from "../index";

export namespace partialUtil {
  // export type DeepPartial<T extends AnyZodObject> = T extends AnyZodObject
  //   ? ZodObject<
  //       { [k in keyof T["_shape"]]: InternalDeepPartial<T["_shape"][k]> },
  //       T["_unknownKeys"],
  //       T["_catchall"]
  //     >
  //   : T extends ZodArray<infer Type, infer Card>
  //   ? ZodArray<InternalDeepPartial<Type>, Card>
  //   : ZodOptional<T>;

  // {
  //   // optional: T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;
  //   // array: T extends ZodArray<infer Type> ? ZodArray<DeepPartial<Type>> : never;
  //   object: T extends AnyZodObject
  //     ? ZodObject<
  //         { [k in keyof T["_shape"]]: DeepPartial<T["_shape"][k]> },
  //         T["_unknownKeys"],
  //         T["_catchall"]
  //       >
  //     : never;
  //   rest: ReturnType<T["optional"]>; // ZodOptional<T>;
  // }[T extends AnyZodObject
  //   ? "object" // T extends ZodOptional<any> // ? 'optional' // :
  //   : "rest"];

  export type DeepPartial<T extends ZodTypeAny> = T extends ZodObject<
    infer Shape,
    infer Params,
    infer Catchall
  >
    ? ZodObject<
        { [k in keyof Shape]: ZodOptional<DeepPartial<Shape[k]>> },
        Params,
        Catchall
      >
    : T extends ZodArray<infer Type, infer Card>
    ? ZodArray<DeepPartial<Type>, Card>
    : T extends ZodOptional<infer Type>
    ? ZodOptional<DeepPartial<Type>>
    : T extends ZodNullable<infer Type>
    ? ZodNullable<DeepPartial<Type>>
    : T extends ZodTuple<infer Items>
    ? {
        [k in keyof Items]: Items[k] extends ZodTypeAny
          ? DeepPartial<Items[k]>
          : never;
      } extends infer PI
      ? PI extends ZodTupleItems
        ? ZodTuple<PI>
        : never
      : never
    : T;
  //  {
  //     // optional: T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;
  //     // array: T extends ZodArray<infer Type> ? ZodArray<DeepPartial<Type>> : never;
  //     object: T extends ZodObject<infer Shape, infer Params, infer Catchall>
  //       ? ZodOptional<
  //           ZodObject<
  //             { [k in keyof Shape]: DeepPartial<Shape[k]> },
  //             Params,
  //             Catchall
  //           >
  //         >
  //       : never;
  //     rest: ReturnType<T["optional"]>;
  //   }[T extends ZodObject<any>
  //     ? "object" // T extends ZodOptional<any> // ? 'optional' // :
  //     : "rest"];
}
