import * as z from './base';
import { MergeShapes } from '../util';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape>
  extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T; //{ [k in keyof T]: T[k]['_def'] };
}

// type asdf = {asdf:string}  & {asdf:number};

type OptionalKeys<T extends z.ZodRawShape> = {
  [k in keyof T]: undefined extends T[k]['_type'] ? k : never;
}[keyof T];
type RequiredKeys<T extends z.ZodRawShape> = Exclude<keyof T, OptionalKeys<T>>;
type ObjectType<T extends z.ZodRawShape> = {
  [k in OptionalKeys<T>]?: T[k]['_type'];
} &
  { [k in RequiredKeys<T>]: T[k]['_type'] };

export class ZodObject<T extends z.ZodRawShape> extends z.ZodType<
  ObjectType<T>, // { [k in keyof T]: T[k]['_type'] },
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
    const merged: ZodObject<MergeShapes<T, U>> = new ZodObject({
      t: z.ZodTypes.object,
      shape: {
        ...this._def.shape,
        ...other._def.shape,
      },
    }) as any;
    return merged;
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
