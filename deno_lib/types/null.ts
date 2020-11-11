import * as z from './base.ts';
// import { ZodUndefined } from './undefined.ts';
// import { ZodUnion } from './union.ts';

export interface ZodNullDef extends z.ZodTypeDef {
  t: z.ZodTypes.null;
}

export class ZodNull extends z.ZodType<null, ZodNullDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodNull => {
    return new ZodNull({
      t: z.ZodTypes.null,
    });
  };
}
