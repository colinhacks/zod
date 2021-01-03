import { ZodTypes } from "../ZodTypes";
import { input, output, ZodType, ZodTypeDef, ZodTypeAny } from "./base";

// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  t: ZodTypes.lazy;
  getter: () => T;
}

export class ZodLazy<T extends ZodTypeAny> extends ZodType<
  output<T>,
  ZodLazyDef<T>,
  input<T>
> {
  get schema(): T {
    return this._def.getter();
  }

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => {
    throw new Error("Can't JSONify recursive structure");
  };

  static create = <T extends ZodTypeAny>(getter: () => T): ZodLazy<T> => {
    return new ZodLazy({
      t: ZodTypes.lazy,
      getter: getter,
    });
  };
}
