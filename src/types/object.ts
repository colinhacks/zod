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
  Def['unknownKeys']
> => {
  return new ZodObject({
    ...def,
    shape: () => ({
      ...def.shape(),
      ...augmentation,
    }),
  }) as any;
};

type UnknownKeysParam = 'allow' | 'strict' | 'strip';

export interface ZodObjectDef<
  T extends z.ZodRawShape = z.ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
  // Params extends ZodObjectParams = ZodObjectParams
> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: () => T;
  unknownKeys: UnknownKeys;
  // params: Params;
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

// interface ZodObjectParams {
//   strict: boolean;
// }

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

// type SetKey<
//   Target extends object,
//   Key extends string,
//   Value extends any
// > = objectUtil.Flatten<
//   { [k in Exclude<keyof Target, Key>]: Target[k] } & { [k in Key]: Value }
// >;

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

// type ZodObjectType<
//   T extends z.ZodRawShape,
//   Params extends ZodObjectParams
// > = Params['strict'] extends true
//   ? objectUtil.ObjectType<T>
//   : objectUtil.Flatten<objectUtil.ObjectType<T> & { [k: string]: any }>;

export class ZodObject<
  T extends z.ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'allow',
  // Params extends ZodObjectParams = { strict: true },
  // Type extends ZodObjectType<T, Params> = ZodObjectType<T, Params>
  Input extends objectUtil.ObjectTypeInput<T> = objectUtil.ObjectTypeInput<T>,
  Output extends objectUtil.ObjectTypeOutput<T> = objectUtil.ObjectTypeOutput<T>
> extends z.ZodType<Input, ZodObjectDef<T, UnknownKeys>, Output> {
  readonly _shape!: T;
  readonly _unknownKeys!: UnknownKeys;

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

  strict = (): ZodObject<T, 'strict'> =>
    new ZodObject({
      shape: this._def.shape,

      t: z.ZodTypes.object,
      unknownKeys: 'strict',
    }) as any;

  allowUnknown = (): ZodObject<T, 'allow'> =>
    new ZodObject({
      shape: this._def.shape,

      t: z.ZodTypes.object,
      unknownKeys: 'allow',
    }) as any;

  nonstrict = this.allowUnknown;

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  augment = AugmentFactory<ZodObjectDef<T, UnknownKeys>>(this._def);
  extend = AugmentFactory<ZodObjectDef<T, UnknownKeys>>(this._def);

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <Incoming extends ZodObject<any>>(
    other: ZodObject<Incoming['_shape']>,
  ) => ZodObject<
    T & Incoming['_shape'],
    UnknownKeys
    // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
  > = objectUtil.mergeObjects(this as any);

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<
    objectUtil.NoNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
    UnknownKeys
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
    UnknownKeys
  > => {
    const shape: any = {};
    Object.keys(this.shape).map(key => {
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
    { [k in keyof T]: ZodUnion<[T[k], ZodUndefined]> },
    UnknownKeys
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
      console.log(`key ${key}:`);
      console.log(val);
      if (val instanceof ZodUnion) {
        console.log(`${key} is union!`);
        const options = (val as ZodUnion<any>)._def.options;
        if (options.length === 2) {
          console.log(`found ${options.length} options`);
          // .length === 2;
          if (options[0] instanceof ZodUndefined) {
            newShape[key] = options[1];
          } else if (options[1] instanceof ZodUndefined) {
            newShape[key] = options[0];
          }
        } else {
          newShape[key] = val;
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
      {
        [k in keyof T]: [T[k]['_output']] extends [Scalars] ? T[k] : never;
      }
    >,
    UnknownKeys
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
        [k in keyof T]: [T[k]['_output']] extends [Scalars] ? never : T[k];
      }
    >,
    UnknownKeys
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
      unknownKeys: 'allow',
      //  params: {
      //    strict: true,
      //  },
    });
  };

  static lazycreate = <T extends z.ZodRawShape>(
    shape: () => T,
  ): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      shape,
      unknownKeys: 'allow',
      //  params: {
      //    strict: true,
      //  },
    });
  };
}
