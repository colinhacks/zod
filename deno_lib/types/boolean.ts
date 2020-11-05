import * as z from './base.ts';
// import { ZodUndefined } from './undefined.ts';
// import { ZodNull } from './null.ts';
// import { ZodUnion } from './union.ts';

export interface ZodBooleanDef extends z.ZodTypeDef {
  t: z.ZodTypes.boolean;
}

export class ZodBoolean extends z.ZodType<boolean, ZodBooleanDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodBoolean => {
    return new ZodBoolean({
      t: z.ZodTypes.boolean,
    });
  };
}
