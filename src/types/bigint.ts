import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodBigIntDef extends z.ZodTypeDef {
  t: z.ZodTypes.bigint;
}

export class ZodBigInt extends z.ZodType<bigint, ZodBigIntDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  static create = (): ZodBigInt => {
    return new ZodBigInt({
      t: z.ZodTypes.bigint,
    });
  };
}
