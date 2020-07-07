import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodUnknownDef extends z.ZodTypeDef {
  t: z.ZodTypes.unknown;
}

export class ZodUnknown extends z.ZodType<unknown, ZodUnknownDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodUnknown => {
    return new ZodUnknown({
      t: z.ZodTypes.unknown,
    });
  };
}
