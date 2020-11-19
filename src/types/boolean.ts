import { ZodType, ZodTypes, ZodTypeDef } from '../internal';

export interface ZodBooleanDef extends ZodTypeDef {
  t: ZodTypes.boolean;
}

export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodBoolean => {
    return new ZodBoolean({
      t: ZodTypes.boolean,
    });
  };
}
