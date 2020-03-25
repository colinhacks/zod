import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

type Primitive = string | number | boolean | null | undefined;
// type Compound<U extends Primitive> =
//   | U
//   | { [name: string]: Compound<U> }
//   | []
//   | [Compound<U>]
//   | [Compound<U>, ...Compound<U>[]];
// type LiteralValue<U extends Primitive = Primitive> = U | Compound<U>;
type LiteralValue = Primitive;

export interface ZodLiteralDef<T extends LiteralValue = LiteralValue> extends z.ZodTypeDef {
  t: z.ZodTypes.literal;
  value: T;
}

export class ZodLiteral<T extends LiteralValue> extends z.ZodType<T, ZodLiteralDef<T>> {
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
