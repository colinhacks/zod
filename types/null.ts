import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodNullDef extends z.ZodTypeDef {
  t: z.ZodTypes.null;
}

export class ZodNull extends z.ZodType<null, ZodNullDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () =>
    ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () =>
    ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodNull => {
    return new ZodNull({
      t: z.ZodTypes.null,
    });
  };
}
