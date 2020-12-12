import * as z from "./base";
import { ZodTypes } from "../ZodTypes"
// import { ZodUnion } from './union';
// import { ZodNull } from './null';

export interface ZodUndefinedDef extends z.ZodTypeDef {
  t: ZodTypes.undefined;
}

export class ZodUndefined extends z.ZodType<undefined> {
  toJSON = () => this._def;

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = (): ZodUndefined => {
    return new ZodUndefined({
      t: ZodTypes.undefined,
    });
  };
}
