import * as z from './base';
import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
import { ZodUnion } from './union';
import { objectUtil } from '../helpers/objectUtil';
import { partialUtil } from '../helpers/partialUtil';
import { isScalar } from '../isScalar';

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <
  Augmentation extends z.ZodRawShape
>(
  augmentation: Augmentation,
): ZodObject<
  {
    [k in Exclude<
      keyof ReturnType<Def['shape']>,
      keyof Augmentation
    >]: ReturnType<Def['shape']>[k];
  } &
    { [k in keyof Augmentation]: Augmentation[k] },
  Def['params']
> => {
  return new ZodObject({
    ...def,
    shape: () => ({
      ...def.shape(),
      ...augmentation,
    }),
  }) as any;
};

export interface ZodObjectDef<
  T extends z.ZodRawShape = z.ZodRawShape,
  Params extends ZodObjectParams = ZodObjectParams
> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: () => T;
  params: Params;
}

const objectDefToJson = (def: ZodObjectDef<any, any>) => ({
  t: def.t,
  shape: Object.assign(
    {},
    Object.keys(def.shape()).map(k => ({
      [k]: def.shape()[k].toJSON(),
    })),
  ),
});

interface ZodObjectParams {
  strict: boolean;
}

export type Scalars =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | bigint
  | bigint[]
  | undefined
  | null;

type SetKey<
  Target extends object,
  Key extends string,
  Value extends any
> = objectUtil.Flatten<
  { [k in Exclude<keyof Target, Key>]: Target[k] } & { [k in Key]: Value }
>;

type makeKeysRequired<T extends ZodObject<any, any>> = T extends ZodObject<
  infer U,
  infer P
>
  ? ZodObject<objectUtil.NoNever<{ [k in keyof U]: makeRequired<U[k]> }>, P>
  : never;
type makeRequired<T extends z.ZodType<any>> = T extends ZodUnion<infer U>
  ? U extends [infer Y, ZodUndefined]
    ? Y
    : U extends [ZodUndefined, infer Z]
    ? Z
    : T
  : T;

type ZodObjectType<
  T extends z.ZodRawShape,
  Params extends ZodObjectParams
> = Params['strict'] extends true
  ? objectUtil.ObjectType<T>
  : objectUtil.Flatten<objectUtil.ObjectType<T> & { [k: string]: any }>;

export class ZodObject<
  T extends z.ZodRawShape,
  Params extends ZodObjectParams = { strict: true },
  Type extends ZodObjectType<T, Params> = ZodObjectType<T, Params>
> extends z.ZodType<Type, ZodObjectDef<T, Params>> {
  readonly _shape!: T;
  readonly _params!: Params;

  get shape() {
    return this._def.shape();
  }

  get params() {
    return this._def.params;
  }

  get t() {
    return this;
  }

  toJSON = () => objectDefToJson(this._def);

  nonstrict = (): ZodObject<T, SetKey<Params, 'strict', false>> =>
    new ZodObject({
      shape: this._def.shape,

      t: z.ZodTypes.object,
      params: {
        ...this._params,
        strict: false,
      },
    }) as any;

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  augment = AugmentFactory<ZodObjectDef<T, Params>>(this._def);
  extend = AugmentFactory<ZodObjectDef<T, Params>>(this._def);

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <
    MergeShape extends z.ZodRawShape,
    MergeParams extends ZodObjectParams
  >(
    other: ZodObject<MergeShape, MergeParams>,
  ) => ZodObject<
    T & MergeShape,
    objectUtil.MergeObjectParams<Params, MergeParams>
  > = objectUtil.mergeObjects(this as any);

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
    Params
  > => {
    const shape: any = {};
    Object.keys(mask).map(key => {
      shape[key] = this.shape[key];
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    });
  };

  omit = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
    Params
  > => {
    const shape: any = {};
    Object.keys(this.shape).map(key => {
      if (!Object.keys(mask).includes(key)) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape,
    });
  };

  partial = (): ZodObject<
    { [k in keyof T]: ZodUnion<[T[k], ZodUndefined]> },
    Params
  > => {
    const newShape: any = {};
    for (const key in this.shape) {
      newShape[key] = this.shape[key].optional();
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    });
  };

  require: () => makeKeysRequired<this> = () => {
    const newShape: any = {};
    for (const key in this.shape) {
      const val = this.shape[key];
      if (val instanceof ZodUnion && val.options.length === 2) {
        if (val.options[0] instanceof ZodUndefined) {
          newShape[key] = val.options[1];
        } else if (val.options[1] instanceof ZodUndefined) {
          newShape[key] = val.options[0];
        }
      } else {
        newShape[key] = val;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  primitives = (): ZodObject<
    objectUtil.NoNever<
      { [k in keyof T]: [T[k]['_type']] extends [Scalars] ? T[k] : never }
    >,
    Params
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
      { [k in keyof T]: [T[k]['_type']] extends [Scalars] ? never : T[k] }
    >,
    Params
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
        newShape[key] = fieldSchema.deepPartial().optional();
      } else {
        newShape[key] = this.shape[key].optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape,
    }) as any;
  };

  // keyof: ()=>ZodEnum<{[k in T]: k}>

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,

      shape: () => shape,
      params: {
        strict: true,
      },
    });
  };

  static lazycreate = <T extends z.ZodRawShape>(
    shape: () => T,
  ): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,

      shape,
      params: {
        strict: true,
      },
    });
  };
}
