import * as z from './base'; // change
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { objectUtil } from '../helpers/objectUtil';
import { partialUtil } from '../helpers/partialUtil';

// import { ZodString } from './string';
// import { maskUtil } from '../helpers/maskUtil';
// import { zodmaskUtil } from '../helpers/zodmaskUtil';
// import { applyMask } from '../masker';

const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <Augmentation extends z.ZodRawShape>(
  augmentation: Augmentation,
): ZodObject<
  { [k in Exclude<keyof Def['shape'], keyof Augmentation>]: Def['shape'][k] } &
    { [k in keyof Augmentation]: Augmentation[k] },
  Def['params']
> => {
  return new ZodObject({
    ...def,
    shape: {
      ...def.shape,
      ...augmentation,
    },
  }) as any;
};

export interface ZodObjectDef<
  T extends z.ZodRawShape = z.ZodRawShape,
  Params extends ZodObjectParams = ZodObjectParams
> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T;
  // strict: boolean;
  params: Params;
}

// const infer = <T extends ZodObjectDef<any>>(def: T): T => def;
// const qewr = infer({ t: z.ZodTypes.object, shape: { asfd: ZodString.create() }, params: { strict: true } });

const objectDefToJson = (def: ZodObjectDef<any, any>) => ({
  t: def.t,
  shape: Object.assign(
    {},
    Object.keys(def.shape).map(k => ({
      [k]: def.shape[k].toJSON(),
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

export class ZodObject<T extends z.ZodRawShape, Params extends ZodObjectParams = { strict: true }> extends z.ZodType<
  ZodObjectType<T, Params>, // { [k in keyof T]: T[k]['_type'] },
  ZodObjectDef<T, Params>
> {
  readonly _shape!: T;
  private readonly _params!: Params;

  get shape() {
    return this._def.shape;
  }

  get params() {
    return this._def.params;
  }

  toJSON = () => objectDefToJson(this._def);

  nonstrict = (): ZodObject<T, SetKey<Params, 'strict', false>> =>
    new ZodObject({
      shape: this._def.shape,
      //  strict: false,
      t: z.ZodTypes.object,
      params: {
        ...this._params,
        strict: false,
      },
    }) as any;

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  //
  augment = AugmentFactory<ZodObjectDef<T, Params>>(this._def);
  // augment = <Augmentation extends z.ZodRawShape>(
  //   augmentation: Augmentation,
  // ): ZodObject<
  //   { [k in Exclude<keyof T, keyof Augmentation>]: T[k] } & { [k in keyof Augmentation]: Augmentation[k] },
  //   Params
  // > => {
  //   return new ZodObject({
  //     ...this._def,
  //     shape: {
  //       ...this._def.shape,
  //       ...augmentation,
  //     },
  //   }) as any;
  // };

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <MergeShape extends z.ZodRawShape, MergeParams extends ZodObjectParams>(
    other: ZodObject<MergeShape, MergeParams>,
  ) => ZodObject<T & MergeShape, objectUtil.MergeObjectParams<Params, MergeParams>> = objectUtil.mergeObjects(this);

  pick = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }, Params> => {
    const shape: any = {};
    Object.keys(mask).map(key => {
      shape[key] = this._def.shape[key];
    });
    return new ZodObject({
      ...this._def,
      shape,
    });
  };

  // omitKeys = <OmitKeys extends (keyof T)[]>(...omit:OmitKeys):OmitKeys => omit;
  omit = <Mask extends { [k in keyof T]?: true }>(
    mask: Mask,
  ): ZodObject<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }, Params> => {
    const shape: any = {};
    Object.keys(this._def.shape).map(key => {
      if (!Object.keys(mask).includes(key)) {
        shape[key] = this._def.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape,
    });
  };

  partial = (): ZodObject<{ [k in keyof T]: ZodUnion<[T[k], ZodUndefined]> }, Params> => {
    const newShape: any = {};
    for (const key in this.shape) {
      newShape[key] = this.shape[key].optional();
    }
    return new ZodObject({
      ...this._def,
      shape: newShape,
    });
  };

  deepPartial = (): partialUtil.RootDeepPartial<ZodObject<T>> => {
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
      shape: newShape,
    }) as any;
  };

  // pick = <Mask extends zodmaskUtil.Params<ZodObject<T>>>(
  //   mask: Mask,
  // ): zodmaskUtil.pick<ZodObject<T, Params>, Mask> => {
  //   return applyMask(this, mask, 'pick');
  // };

  // omit = <Mask extends zodmaskUtil.Params<ZodObject<T>>>(
  //   mask: Mask,
  // ): zodmaskUtil.omit<ZodObject<T, Params>, Mask> => {
  //   return applyMask(this, mask, 'omit');
  // };

  // relations = <Rels extends { [k: string]: any }>(
  //   lazyShape: { [k in keyof Rels]: ZodLazy<z.ZodType<Rels[k]>> },
  // ): RelationsReturnType<Rels, T> => {
  //   // const relationShape: any = {};
  //   // for (const key in lazyShape) {
  //   //   relationShape[key] = lazyShape[key]();
  //   // }
  //   // console.log(relationShape);
  //   // const relationKeys = Object.keys(lazyShape);
  //   // const existingKeys = Object.keys(this._def.shape);
  //   return new ZodObject({
  //     t: z.ZodTypes.object,
  //     strict: this._def.strict,
  //     shape: {
  //       ...this._def.shape,
  //       ...lazyShape,
  //     },
  //   }) as any;
  // };

  // static recursion = <R extends { [k: string]: any }>() => <T extends ZodObject<any>>(
  //   shape: withRefsInputType<T, R>,
  // ): ZodObject<withRefsReturnType<T, R>> => {
  //   //  const getters =
  //   return new ZodObject({ t: z.ZodTypes.object, strict: true, shape(); });
  // };

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      //  strict: true,
      shape,
      params: {
        strict: true,
      },
    });
  };
}
