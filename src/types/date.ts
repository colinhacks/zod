import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodDateDef extends ZodTypeDef {
  t: ZodTypes.date;
}

export class ZodDate extends ZodType<Date, ZodDateDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodDate => {
    return new ZodDate({
      t: ZodTypes.date,
    });
  };
}
