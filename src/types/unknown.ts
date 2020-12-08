import * as z from "./base";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodUnknownDef extends z.ZodTypeDef {
  t: z.ZodTypes.unknown;
}

export class ZodUnknown extends z.ZodType<unknown, ZodUnknownDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodUnknown => {
    return new ZodUnknown({
      t: z.ZodTypes.unknown,
    });
  };
}
