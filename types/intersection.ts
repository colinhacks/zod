import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodIntersectionDef<
  T extends z.ZodAny = z.ZodAny,
  U extends z.ZodAny = z.ZodAny
> extends z.ZodTypeDef {
  t: z.ZodTypes.intersection;
  left: T;
  right: U;
}

export class ZodIntersection<
  T extends z.ZodAny,
  U extends z.ZodAny
> extends z.ZodType<T['_type'] & U['_type'], ZodIntersectionDef<T, U>> {
  left: T;
  right: U;

  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  toJSON = () => ({
    t: this._def.t,
    left: this._def.left.toJSON(),
    right: this._def.right.toJSON(),
  });

  static create = <T extends z.ZodAny, U extends z.ZodAny>(
    left: T,
    right: U
  ): ZodIntersection<T, U> => {
    return new ZodIntersection({
      t: z.ZodTypes.intersection,
      left: left,
      right: right,
    });
  };
}
