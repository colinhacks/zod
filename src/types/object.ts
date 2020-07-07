/* eslint-disable @typescript-eslint/no-explicit-any */
import * as objectUtil from '../helpers/objectUtil';
import * as partialUtil from '../helpers/partialUtil';
import * as z from './base'; // change
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
import { ZodError } from '..';

type Mask<T extends z.ZodRawShape> =
  | true
  | {
      [k in keyof T]?: T[k] extends ZodObjectType<infer S, infer _> ? Mask<S> : true;
    };

type MaskPick<T extends z.ZodRawShape, M extends Mask<T>> = M extends true
  ? T
  : {
      [k in keyof M]: k extends keyof T
        ? M[k] extends true
          ? T[k]
          : T[k] extends ZodObjectType<infer S, infer _>
          ? M[k] extends infer Y
            ? Y extends Mask<S>
              ? MaskPick<S, Y>
              : never
            : never
          : never
        : never;
    };

type MaskOmit<T extends z.ZodRawShape, M extends Mask<T>> = M extends true
  ? never
  : {
      [k in keyof T]: k extends keyof M
        ? M[k] extends true
          ? never
          : T[k] extends ZodObjectType<infer S, infer _>
          ? M[k] extends infer Y
            ? Y extends Mask<S>
              ? MaskOmit<S, Y>
              : T[k]
            : T[k]
          : T[k]
        : T[k];
    };

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
  params: Params;
}

const objectDefToJson = (def: ZodObjectDef<any, any>) => ({
  t: def.t,
  shape: Object.assign(
    {},
    Object.keys(def.shape).map((k) => ({
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
  extend = AugmentFactory<ZodObjectDef<T, Params>>(this._def);

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <MergeShape extends z.ZodRawShape, MergeParams extends ZodObjectParams>(
    other: ZodObject<MergeShape, MergeParams>,
  ) => ZodObject<T & MergeShape, objectUtil.MergeObjectParams<Params, MergeParams>> = objectUtil.mergeObjects(this);

  pick = <M extends Mask<T>>(mask: M): ZodObject<MaskPick<T, M>, Params> => {
    if (mask === true) {
      return this as any;
    }

    if (typeof mask !== 'object' || mask instanceof Array) {
      throw ZodError.fromString(`Cannot pick keys from non-object type '${typeof mask}'`);
    }

    const unknownKeys = Object.keys(mask).filter((key) => !(key in this._def.shape));
    if (unknownKeys.length !== 0) {
      throw ZodError.fromString(`Undefined key(s) for shape: ${unknownKeys.map((x) => `'${x}'`).join(', ')}`);
    }

    const shape: any = {};
    const maskObj: any = mask;
    Object.keys(mask).forEach((key) => {
      const subShape = this._def.shape[key];
      if (key in this._def.shape) {
        if (maskObj[key] === true) {
          shape[key] = subShape;
        } else if (typeof maskObj[key] === 'object') {
          if (!(subShape instanceof ZodObject)) {
            throw ZodError.create([
              {
                path: [`['${key}']`],
                message: `Value of type '${typeof subShape}' could not be parsed as a ZodObject`,
              },
            ]);
          }

          try {
            const subObject = subShape.pick(maskObj[key]);
            if (Object.keys(subObject).length !== 0) {
              shape[key] = subObject;
            }
          } catch (err) {
            if (!(err instanceof ZodError)) {
              throw err;
            }
            throw err.bubbleUp(`['${key}']`);
          }
        }
      }
    });

    return new ZodObject({
      t: z.ZodTypes.object,
      params: this.params,
      shape,
    });
  };

  omit = <M extends Mask<T>>(mask: M): ZodObject<MaskOmit<T, M>, Params> => {
    if (typeof mask !== 'object' || mask instanceof Array) {
      throw ZodError.fromString(`Cannot omit keys from non-object type '${typeof mask}'`);
    }

    const unknownKeys = Object.keys(mask).filter((key) => !(key in this._def.shape));
    if (unknownKeys.length !== 0) {
      throw ZodError.fromString(`Undefined key(s) for shape: ${unknownKeys.map((x) => `'${x}'`).join(', ')}`);
    }

    const shape: any = {};
    const maskObj: any = mask;

    Object.keys(this._def.shape).forEach((key) => {
      const subShape = this._def.shape[key];
      if (!(key in mask) || (typeof maskObj[key] === 'boolean' && maskObj[key] !== true)) {
        shape[key] = subShape;
      } else {
        if (typeof maskObj[key] === 'object') {
          if (!(subShape instanceof ZodObject)) {
            throw ZodError.create([
              {
                path: [`['${key}']`],
                message: `Value of type '${typeof subShape}' could not be parsed as a ZodObject`,
              },
            ]);
          }

          try {
            const subObject = subShape.omit(maskObj[key]);
            if (Object.keys(subObject).length !== 0) {
              shape[key] = subObject;
            }
          } catch (err) {
            if (!(err instanceof ZodError)) {
              throw err;
            }
            throw err.bubbleUp(`['${key}']`);
          }
        }
      }
    });

    return new ZodObject({
      t: z.ZodTypes.object,
      params: this.params,
      shape,
    });
  };

  partial = (): ZodObject<{ [k in keyof T]: ZodUnion<[T[k], ZodUndefined]> }, Params> => {
    const newShape: any = {};
    Object.keys(this.shape).forEach((k) => {
      newShape[k] = this.shape[k].optional();
    });

    return new ZodObject({
      ...this._def,
      shape: newShape,
    });
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  deepPartial = (): partialUtil.RootDeepPartial<ZodObject<T>> => {
    const newShape: any = {};
    Object.keys(this.shape).forEach((k) => {
      const fieldSchema = this.shape[k];
      if (fieldSchema instanceof ZodObject) {
        newShape[k] = fieldSchema.deepPartial().optional();
      } else {
        newShape[k] = this.shape[k].optional();
      }
    });
    return new ZodObject({
      ...this._def,
      shape: newShape,
    }) as any;
  };

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
