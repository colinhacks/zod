import * as z from './base';
import { ZodUndefined } from './undefined';

export interface ZodUnionDef<
  T extends [z.ZodAny, ...z.ZodAny[]] = [z.ZodAny, ...z.ZodAny[]]
> extends z.ZodTypeDef {
  t: z.ZodTypes.union;
  options: T;
}

export class ZodUnion<
  T extends [z.ZodAny, z.ZodAny, ...z.ZodAny[]]
> extends z.ZodType<T[number]['_type'], ZodUnionDef<T>> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  toJSON = () => ({
    t: this._def.t,
    options: this._def.options.map(x => x.toJSON()),
  });

  static create = <T extends [z.ZodAny, z.ZodAny, ...z.ZodAny[]]>(
    types: T
  ): ZodUnion<T> => {
    return new ZodUnion({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}
