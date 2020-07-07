import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodIntersectionDef<T extends z.ZodTypeAny = z.ZodTypeAny, U extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.intersection;
  left: T;
  right: U;
}

export class ZodIntersection<T extends z.ZodTypeAny, U extends z.ZodTypeAny> extends z.ZodType<
  T['_type'] & U['_type'],
  ZodIntersectionDef<T, U>
> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => ({
    t: this._def.t,
    left: this._def.left.toJSON(),
    right: this._def.right.toJSON(),
  });

  static create = <T extends z.ZodTypeAny, U extends z.ZodTypeAny>(left: T, right: U): ZodIntersection<T, U> => {
    return new ZodIntersection({
      t: z.ZodTypes.intersection,
      left,
      right,
    });
  };
}
