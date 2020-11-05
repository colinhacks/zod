import * as z from './base.ts';
// import { ZodUndefined } from './undefined.ts';
// import { ZodNull } from './null.ts';
// import { ZodUnion } from './union.ts';

export interface ZodVoidDef extends z.ZodTypeDef {
  t: z.ZodTypes.void;
}

export class ZodVoid extends z.ZodType<void, ZodVoidDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodVoid => {
    return new ZodVoid({
      t: z.ZodTypes.void,
    });
  };
}
