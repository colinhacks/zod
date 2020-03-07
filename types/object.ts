import * as z from './base';
import { MergeShapes } from '../util';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape>
  extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T; //{ [k in keyof T]: T[k]['_def'] };
}

export class ZodObject<T extends z.ZodRawShape> extends z.ZodType<
  { [k in keyof T]: T[k]['_type'] },
  ZodObjectDef<T>
> {
  toJSON = () => ({
    t: this._def.t,
    shape: Object.assign(
      {},
      Object.keys(this._def.shape).map(k => ({
        [k]: this._def.shape[k].toJSON(),
      }))
    ),
  });

  merge = <U extends z.ZodRawShape>(
    other: ZodObject<U>
  ): ZodObject<MergeShapes<T, U>> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      shape: {
        ...this._def.shape,
        ...other._def.shape,
      },
    });
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      shape,
    });
  };
}
