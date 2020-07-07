/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodAnyDef extends z.ZodTypeDef {
  t: z.ZodTypes.any;
}

export class ZodAny extends z.ZodType<any, ZodAnyDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  toJSON = () => this._def;

  static create = (): ZodAny => {
    return new ZodAny({
      t: z.ZodTypes.any,
    });
  };
}
