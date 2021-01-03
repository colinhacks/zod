import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base";
// import { ZodUndefined } from './undefined';
// import { ZodUnion } from './union';

export interface ZodNullDef extends ZodTypeDef {
  t: ZodTypes.null;
}

export class ZodNull extends ZodType<null, ZodNullDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodNull => {
    return new ZodNull({
      t: ZodTypes.null,
    });
  };
}
