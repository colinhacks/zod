import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodNumberDef extends z.ZodTypeDef {
  t: z.ZodTypes.number;
}

export class ZodNumber extends z.ZodType<number, ZodNumberDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  toJSON = () => this._def;
  static create = (): ZodNumber => {
    return new ZodNumber({
      t: z.ZodTypes.number,
    });
  };
}
