import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodBooleanDef extends ZodTypeDef {
  t: ZodTypes.boolean;
}

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodBoolean => {
    return new ZodBoolean({
      t: ZodTypes.boolean,
    });
  };
}
