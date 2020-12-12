import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodUnknownDef extends ZodTypeDef {
  t: ZodTypes.unknown;
}

export class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodUnknown => {
    return new ZodUnknown({
      t: ZodTypes.unknown,
    });
  };
}
