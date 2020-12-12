import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";
import { ZodTypeAny } from "./base/type-any";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodIntersectionDef<
  T extends ZodTypeAny = ZodTypeAny,
  U extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  t: ZodTypes.intersection;
  left: T;
  right: U;
}

export class ZodIntersection<
  T extends ZodTypeAny,
  U extends ZodTypeAny
> extends ZodType<
  T["_output"] & U["_output"],
  ZodIntersectionDef<T, U>,
  T["_input"] & U["_input"]
> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => ({
    t: this._def.t,
    left: this._def.left.toJSON(),
    right: this._def.right.toJSON(),
  });

  static create = <T extends ZodTypeAny, U extends ZodTypeAny>(
    left: T,
    right: U
  ): ZodIntersection<T, U> => {
    return new ZodIntersection({
      t: ZodTypes.intersection,
      left: left,
      right: right,
    });
  };
}
