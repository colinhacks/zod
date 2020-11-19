import { ZodTypeDef, ZodType, ZodTypes } from '../internal';

export interface ZodBigIntDef extends ZodTypeDef {
  t: ZodTypes.bigint;
}

export class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  static create = (): ZodBigInt => {
    return new ZodBigInt({
      t: ZodTypes.bigint,
    });
  };
}
