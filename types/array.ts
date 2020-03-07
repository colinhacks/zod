import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodArrayDef<T extends z.ZodAny = z.ZodAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.array;
  type: T;
}

export class ZodArray<T extends z.ZodAny> extends z.ZodType<
  T['_type'][],
  ZodArrayDef<T>
> {
  toJSON = () => {
    return {
      t: this._def.t,
      type: this._def.type.toJSON(),
    };
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  static create = <T extends z.ZodAny>(schema: T): ZodArray<T> => {
    return new ZodArray({
      t: z.ZodTypes.array,
      type: schema,
    });
  };
}
