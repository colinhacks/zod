import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

// type Primitive = string | number | boolean | null | undefined;
type Primitive = string | number | boolean | null | undefined;
// type LiteralValue<U extends Primitive = Primitive> =
//   | U
//   | { [name: string]: LiteralValue<U> }
//   | []
//   | [LiteralValue<U>]
//   | [LiteralValue<U>, ...LiteralValue<U>[]];
// type LiteralValue<U extends Primitive> = Compound<U>;
type LiteralValue = Primitive;

// this function infers the EXACT type of the value passed into it
// and returns it as a const will full type information
// const inferLiteral = <U extends Primitive, T extends LiteralValue<U>>(arg: T): T => {
//   return arg;
// };

// type AnyLiteral = LiteralValue<any>;
// type LiteralValue = Primitive;

// const inferLiteral = <T extends LiteralValue>(arg: T): T => {
//   return arg;
// };

// const qwer = inferLiteral({ asdf: 'qwerwe' });

export interface ZodLiteralDef<T extends any = any> extends z.ZodTypeDef {
  t: z.ZodTypes.literal;
  value: T;
}

export class ZodLiteral<T extends any> extends z.ZodType<T, ZodLiteralDef<T>> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  // static create = <U extends Primitive, T extends LiteralValue<U>>(value: T): ZodLiteral<T> => {
  static create = <T extends LiteralValue>(value: T): ZodLiteral<T> => {
    return new ZodLiteral({
      t: z.ZodTypes.literal,
      value: value,
    });
  };
}
