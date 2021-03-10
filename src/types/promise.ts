import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeAny, ZodTypeDef } from "./base";

// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  t: ZodTypes.promise;
  type: T;
}

export class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T["_output"]>,
  ZodPromiseDef<T>,
  Promise<T["_input"]>
> {
  toJSON = () => {
    return {
      t: this._def.t,
      type: this._def.type.toJSON(),
    };
  };

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends ZodTypeAny>(schema: T): ZodPromise<T> => {
    return new ZodPromise({
      t: ZodTypes.promise,
      type: schema,
    });
  };
}
