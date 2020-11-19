import { ZodTypeDef, ZodType, ZodTypes } from '../internal';

export interface ZodAnyDef extends ZodTypeDef {
  t: ZodTypes.any;
}

export class ZodAny extends ZodType<any, ZodAnyDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodAny => {
    return new ZodAny({
      t: ZodTypes.any,
    });
  };
}
