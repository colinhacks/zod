import { ZodTypes } from "../ZodTypes.ts";
import { ZodType, ZodTypeDef } from "./base.ts";

export interface ZodNeverDef extends ZodTypeDef {
  t: ZodTypes.never;
}

export class ZodNever extends ZodType<never, ZodNeverDef> {
  __class = "ZodNever";
  toJSON = () => this._def;

  static create = (): ZodNever => {
    return new ZodNever({
      t: ZodTypes.never,
    });
  };
}
