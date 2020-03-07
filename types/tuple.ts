import * as z from './base';
import { ZodUnion } from './union';
import { ZodUndefined } from './undefined';

export interface ZodTupleDef<
  T extends [z.ZodAny, ...z.ZodAny[]] = [z.ZodAny, ...z.ZodAny[]]
> extends z.ZodTypeDef {
  t: z.ZodTypes.tuple;
  items: T;
}

export class ZodTuple<
  T extends [z.ZodAny, ...z.ZodAny[]] = [z.ZodAny, ...z.ZodAny[]]
> extends z.ZodType<z.TypeOfTuple<T>, ZodTupleDef<T>> {
  toJSON = () => ({
    t: this._def.t,
    items: this._def.items.map(item => item.toJSON()),
  });

  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  static create = <T extends [z.ZodAny, ...z.ZodAny[]]>(
    schemas: T
  ): ZodTuple<T> => {
    return new ZodTuple({
      t: z.ZodTypes.tuple,
      items: schemas,
    });
  };
}
