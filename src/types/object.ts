// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';
import { objectUtil } from "../helpers/objectUtil";
// import { mergeShapes } from "../helpers/objectUtil/merge";
import { partialUtil } from "../helpers/partialUtil";
import { Scalars } from "../helpers/primitive";
import { isScalar } from "../isScalar";
import { ZodTypes } from "../ZodTypes";
import { ZodRawShape, ZodType, ZodTypeAny, ZodTypeDef } from "./base";
import { ZodNever } from "./never";

export const mergeObjects = <First extends AnyZodObject>(first: First) => <
  Second extends AnyZodObject
>(
  second: Second
): ZodObject<
  First["_shape"] & Second["_shape"],
  First["_unknownKeys"],
  First["_catchall"]
  // MergeObjectParams<First['_params'], Second['_params']>,
  // First['_input'] & Second['_input'],
  // First['_output'] & Second['_output']
> => {
  const mergedShape = objectUtil.mergeShapes(
    first._def.shape(),
    second._def.shape()
  );
  const merged: any = new ZodObject({
    t: ZodTypes.object,
    effects: [...(first._def.effects || []), ...(second._def.effects || [])],
    unknownKeys: first._def.unknownKeys,
    catchall: first._def.catchall,
    // params: {
    //   strict: first.params.strict && second.params.strict,
    // },
    shape: () => mergedShape,
  }) as any;
  return merged;
};

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <
  Augmentation extends ZodRawShape
>(
  augmentation: Augmentation
): ZodObject<
  {
    [k in Exclude<
      keyof ReturnType<Def["shape"]>,
      keyof Augmentation
    >]: ReturnType<Def["shape"]>[k];
  } &
    { [k in keyof Augmentation]: Augmentation[k] },
  Def["unknownKeys"],
  Def["catchall"]
> => {
  return new ZodObject({
    ...def,
    shape: () => ({
      ...def.shape(),
      ...augmentation,
    }),
  }) as any;
};

type UnknownKeysParam = "passthrough" | "strict" | "strip";

export interface ZodObjectDef<
  T extends ZodRawShape = ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny
  // Params extends ZodObjectParams = ZodObjectParams
> extends ZodTypeDef {
  t: ZodTypes.object;
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
  // params: Params;
}

export type baseObjectOutputType<
  Shape extends ZodRawShape
  // Catchall extends ZodTypeAny
> = objectUtil.flatten<
  objectUtil.addQuestionMarks<
    {
      [k in keyof Shape]: Shape[k]["_output"];
    }
  > //{ [k: string]: Catchall['_output'] }
>;

export type objectOutputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny
> = ZodTypeAny extends Catchall
  ? baseObjectOutputType<Shape>
  : objectUtil.flatten<
      baseObjectOutputType<Shape> & { [k: string]: Catchall["_output"] }
    >;

export type baseObjectInputType<Shape extends ZodRawShape> = objectUtil.flatten<
  objectUtil.addQuestionMarks<
    {
      [k in keyof Shape]: Shape[k]["_input"];
    }
  >
>;

export type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny
> = ZodTypeAny extends Catchall
  ? baseObjectInputType<Shape>
  : objectUtil.flatten<
      baseObjectInputType<Shape> & { [k: string]: Catchall["_input"] }
    >;

const objectDefToJson = (def: ZodObjectDef<any, any>) => ({
  t: def.t,
  shape: Object.assign(
    {},
    ...Object.keys(def.shape()).map((k) => ({
      [k]: def.shape()[k].toJSON(),
    }))
  ),
});

// interface ZodObjectParams {
//   strict: boolean;
// }

// type SetKey<
//   Target extends object,
//   Key extends string,
//   Value extends any
// > = objectUtil.Flatten<
//   { [k in Exclude<keyof Target, Key>]: Target[k] } & { [k in Key]: Value }
// >;

// type makeKeysRequired<T extends ZodObject<any, any, any>> = T extends ZodObject<
//   infer U,
//   infer P,
//   infer C
// >
//   ? ZodObject<objectUtil.NoNever<{ [k in keyof U]: makeRequired<U[k]> }>, P, C>
//   : never;

// type makeRequired<T extends ZodType<any>> = T extends ZodUnion<infer U>
//   ? U extends [infer Y, ZodUndefined]
//     ? Y
//     : U extends [ZodUndefined, infer Z]
//     ? Z
//     : T
//   : T;

// type ZodObjectType<
//   T extends ZodRawShape,
//   Params extends ZodObjectParams
// > = Params['strict'] extends true
//   ? objectUtil.ObjectType<T>
//   : objectUtil.Flatten<objectUtil.ObjectType<T> & { [k: string]: any }>;

export class ZodObject<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  // Params extends ZodObjectParams = { strict: true },
  // Type extends ZodObjectType<T, Params> = ZodObjectType<T, Params>
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
> extends ZodType<
  //  objectUtil.objectOutputType<T, UnknownKeys, Catchall>,
  Output,
  ZodObjectDef<T, UnknownKeys, Catchall>,
  Input
> {
  readonly _shape!: T;
  readonly _unknownKeys!: UnknownKeys;
  readonly _catchall!: Catchall;

  get shape() {
    return this._def.shape();
  }

  // get params() {
  //   return this._def.params;
  // }

  //  get t() {
  //    return this;
  //  }

  toJSON = () => objectDefToJson(this._def);

  strict = (): ZodObject<T, "strict", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "strict",
    });

  strip = (): ZodObject<T, "strip", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "strip",
    });

  passthrough = (): ZodObject<T, "passthrough", Catchall> =>
    new ZodObject({
      ...this._def,
      unknownKeys: "passthrough",
    });

  nonstrict = this.passthrough;

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  augment = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);
  extend = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);

  setKey = <Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> => {
    return this.augment({ [key]: schema }) as any;
  };

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <Incoming extends AnyZodObject>(
    other: Incoming
  ) => ZodObject<
    T & Incoming["_shape"],
    UnknownKeys,
    Catchall
    // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
  > = mergeObjects(this as any) as any;

  catchall = <Index extends ZodTypeAny>(
    index: Index
  ): ZodObject<
    T,
    UnknownKeys,
    Index
    // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
  > => {
    return new ZodObject({
      ...this._def,
      // unknownKeys: 'passthrough',
      catchall: index,
    });
  };

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
    UnknownKeys,
    Catchall
  > => {
    const shape: any = {};
    Object.keys(mask).map((key) => {
      shape[key] = this.shape[key];
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    });
  };

  omit = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
    UnknownKeys,
    Catchall
  > => {
    const shape: any = {};
    Object.keys(this.shape).map((key) => {
      if (Object.keys(mask).indexOf(key) === -1) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    });
  };

  partial = (): ZodObject<
    { [k in keyof T]: ReturnType<T[k]["optional"]> },
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      newShape[key] = fieldSchema.isOptional()
        ? fieldSchema
        : fieldSchema.optional();
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    });
  };

  // require: <This extends this>() => makeKeysRequired<This> = () => {
  //   const newShape: any = {};
  //   for (const key in this.shape) {
  //     const val = this.shape[key];
  //     if (val instanceof ZodUnion) {
  //       const options = (val as ZodUnion<any>)._def.options;
  //       if (options.length === 2) {
  //         // .length === 2;
  //         if (options[0] instanceof ZodUndefined) {
  //           newShape[key] = options[1];
  //         } else if (options[1] instanceof ZodUndefined) {
  //           newShape[key] = options[0];
  //         }
  //       } else {
  //         newShape[key] = val;
  //       }
  //     } else {
  //       newShape[key] = val;
  //     }
  //   }
  //   return new ZodObject({
  //     ...this._def,
  //     shape: () => newShape,
  //   }) as any;
  // };

  primitives = (): ZodObject<
    objectUtil.NoNever<
      {
        [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never;
      }
    >,
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      if (isScalar(this.shape[key])) {
        newShape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    });
  };

  nonprimitives = (): ZodObject<
    objectUtil.NoNever<
      {
        [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k];
      }
    >,
    UnknownKeys,
    Catchall
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      if (!isScalar(this.shape[key])) {
        newShape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    });
  };

  deepPartial: () => partialUtil.RootDeepPartial<this> = () => {
    const newShape: any = {};

    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      if (fieldSchema instanceof ZodObject) {
        newShape[key] = fieldSchema.isOptional()
          ? fieldSchema
          : (fieldSchema.deepPartial() as any).optional();
      } else {
        newShape[key] = fieldSchema.isOptional()
          ? fieldSchema
          : fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  // keyof: ()=>ZodEnum<{[k in T]: k}>

  static create = <T extends ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: ZodTypes.object,
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      //  params: {
      //    strict: true,
      //  },
    }) as any;
  };

  static lazycreate = <T extends ZodRawShape>(shape: () => T): ZodObject<T> => {
    return new ZodObject({
      t: ZodTypes.object,
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
    }) as any;
  };
}

export type AnyZodObject = ZodObject<any, any, any>;
