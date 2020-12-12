import * as z from "./base";
import { ZodTypes } from "../ZodTypes"

export interface ZodNeverDef extends z.ZodTypeDef {
  t: ZodTypes.never;
}

export class ZodNever extends z.ZodType<never, ZodNeverDef> {
  toJSON = () => this._def;

  static create = (): ZodNever => {
    return new ZodNever({
      t: ZodTypes.never,
    });
  };
}
