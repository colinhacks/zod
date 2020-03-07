import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodBooleanDef extends z.ZodTypeDef {
  t: z.ZodTypes.boolean;
}

export class ZodBoolean extends z.ZodType<boolean, ZodBooleanDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);

  toJSON = () => this._def;
  static create = (): ZodBoolean => {
    return new ZodBoolean({
      t: z.ZodTypes.boolean,
    });
  };
}
