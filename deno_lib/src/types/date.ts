import * as z from './base.ts';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodDateDef extends z.ZodTypeDef {
  t: z.ZodTypes.date;
}

export class ZodDate extends z.ZodType<Date, ZodDateDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodDate => {
    return new ZodDate({
      t: z.ZodTypes.date,
    });
  };
}
