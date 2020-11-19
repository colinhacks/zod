import { ZodType, ZodTypes, ZodTypeDef } from '../internal';

export interface ZodDateDef extends ZodTypeDef {
  t: ZodTypes.date;
}

export class ZodDate extends ZodType<Date, ZodDateDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodDate => {
    return new ZodDate({
      t: ZodTypes.date,
    });
  };
}
