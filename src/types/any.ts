import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodAnyDef extends z.ZodTypeDef {
  t: z.ZodTypes.any;
}

export class ZodAny extends z.ZodType<any, ZodAnyDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodAny => {
    return new ZodAny({
      t: z.ZodTypes.any,
    });
  };
}
