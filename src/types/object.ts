import * as z from './base';
import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
import { ZodUnion } from './union';
import { objectUtil } from '../helpers/objectUtil';
import { partialUtil } from '../helpers/partialUtil';

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <Augmentation extends z.ZodRawShape>(
  augmentation: Augmentation,
): ZodObject<
  { [k in Exclude<keyof ReturnType<Def['shape']>, keyof Augmentation>]: ReturnType<Def['shape']>[k] } &
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

type SetKey<Target extends object, Key extends string, Value extends any> = objectUtil.Flatten<
  { [k in Exclude<keyof Target, Key>]: Target[k] } & { [k in Key]: Value }
>;

type ZodObjectType<T extends z.ZodRawShape, Params extends ZodObjectParams> = Params['strict'] extends true
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

  toJSON = () => objectDefToJson(this._def);

  // nonstrict = (): ZodObject<T, SetKey<Params, 'strict', false>, Type & { [k: string]: any }> =>
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
  merge: <MergeShape extends z.ZodRawShape, MergeParams extends ZodObjectParams>(
    other: ZodObject<MergeShape, MergeParams>,
  ) => ZodObject<T & MergeShape, objectUtil.MergeObjectParams<Params, MergeParams>> = objectUtil.mergeObjects(
    this as any,
  );

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }, Params> => {
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
  ): ZodObject<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }, Params> => {
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

  partial = (): ZodObject<{ [k in keyof T]: ZodUnion<[T[k], ZodUndefined]> }, Params> => {
    const newShape: any = {};
    for (const key in this.shape) {
      newShape[key] = this.shape[key].optional();
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

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,

      shape: () => shape,
      params: {
        strict: true,
      },
    });
  };

  static lazycreate = <T extends z.ZodRawShape>(shape: () => T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,

      shape,
      params: {
        strict: true,
      },
    });
  };
}
