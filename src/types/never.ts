import * as z from "./base";

export interface ZodNeverDef extends z.ZodTypeDef {
  t: z.ZodTypes.never;
}

export class ZodNever extends z.ZodType<never, ZodNeverDef> {
  toJSON = () => this._def;

  static create = (): ZodNever => {
    return new ZodNever({
      t: z.ZodTypes.never,
    });
  };
}
