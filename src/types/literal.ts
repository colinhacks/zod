import { ZodType, ZodTypes, ZodTypeDef, Primitive } from '../internal';

type LiteralValue = Primitive;

export interface ZodLiteralDef<T extends any = any> extends ZodTypeDef {
  t: ZodTypes.literal;
  value: T;
}

export class ZodLiteral<T extends any> extends ZodType<T, ZodLiteralDef<T>> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  static create = <T extends LiteralValue>(value: T): ZodLiteral<T> => {
    return new ZodLiteral({
      t: ZodTypes.literal,
      value: value,
    });
  };
}
