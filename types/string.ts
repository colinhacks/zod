import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodStringDef extends z.ZodTypeDef {
  t: z.ZodTypes.string;
}

export class ZodString extends z.ZodType<string, ZodStringDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  toJSON = () => this._def;

  static create = (): ZodString => {
    return new ZodString({
      t: z.ZodTypes.string,
    });
  };
}
