import * as z from './base';
import { ZodUnion } from './union';
import { ZodNull } from './null';

export interface ZodUndefinedDef extends z.ZodTypeDef {
  t: z.ZodTypes.undefined;
}

export class ZodUndefined extends z.ZodType<undefined> {
  toJSON = () => this._def;

  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () =>
    ZodUnion.create([this, ZodNull.create()]);

  static create = (): ZodUndefined => {
    return new ZodUndefined({
      t: z.ZodTypes.undefined,
    });
  };
}
