import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodIntersection } from './intersection';

export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T; //{ [k in keyof T]: T[k]['_def'] };
}

type OptionalKeys<T extends z.ZodRawShape> = {
  [k in keyof T]: undefined extends T[k]['_type'] ? k : never;
}[keyof T];
type RequiredKeys<T extends z.ZodRawShape> = Exclude<keyof T, OptionalKeys<T>>;
type ObjectType<T extends z.ZodRawShape> = {
  [k in OptionalKeys<T>]?: T[k]['_type'];
} &
  { [k in RequiredKeys<T>]: T[k]['_type'] };

// type adsf  = OptionalKeys<{name:ZodString}>;
// type asdfqwe = {name:ZodString}['name']['_type']
// type lkjljk  = (undefined) extends (string) ? true : false

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
      })),
    ),
  });

  merge = <U extends ZodObject<any>>(other: U): ZodObject<T & U> => {
    const currShape = this._def.shape;
    const mergeShape = other._def.shape;
    const currKeys = Object.keys(currShape);
    const mergeKeys = Object.keys(mergeShape);
    const sharedKeys = currKeys.filter(k => mergeKeys.indexOf(k) !== -1);

    const sharedShape: any = {};
    for (const k of sharedKeys) {
      sharedShape[k] = ZodIntersection.create(currShape[k], mergeShape[k]);
    }
    const merged: ZodObject<T & U> = new ZodObject({
      t: z.ZodTypes.object,
      shape: {
        ...(this._def.shape as object),
        ...(other._def.shape as object),
        ...sharedShape,
      },
    }) as any;
    return merged;
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      shape,
    });
  };
}
