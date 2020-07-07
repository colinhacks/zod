import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodDateDef extends z.ZodTypeDef {
  t: z.ZodTypes.date;
}

export class ZodDate extends z.ZodType<Date, ZodDateDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodDate => {
    return new ZodDate({
      t: z.ZodTypes.date,
    });
  };
}
