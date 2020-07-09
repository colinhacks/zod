import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { Primitive } from '../helpers/primitive';

type LiteralValue = Primitive;

export interface ZodLiteralDef<T extends any = any> extends z.ZodTypeDef {
  t: z.ZodTypes.literal;
  value: T;
}

export class ZodLiteral<T extends any> extends z.ZodType<T, ZodLiteralDef<T>> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  static create = <T extends LiteralValue>(value: T): ZodLiteral<T> => {
    return new ZodLiteral({
      t: z.ZodTypes.literal,
      value: value,
    });
  };
}
