import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";

export interface ZodNeverDef extends ZodTypeDef {
  t: ZodTypes.never;
}

export class ZodNever extends ZodType<never, ZodNeverDef> {
  toJSON = () => this._def;

  static create = (): ZodNever => {
    return new ZodNever({
      t: ZodTypes.never,
    });
  };
}
