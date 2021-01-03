import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base";
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export type ArrayKeys = keyof any[];
export type Indices<T> = Exclude<keyof T, ArrayKeys>;

type EnumValues = [string, ...string[]];

type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

export interface ZodEnumDef<T extends EnumValues = EnumValues>
  extends ZodTypeDef {
  t: ZodTypes.enum;
  values: T;
}

export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>
> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  get options() {
    return this._def.values;
  }

  get enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Values(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  get Enum(): Values<T> {
    const enumValues: any = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues as any;
  }

  static create = <U extends string, T extends [U, ...U[]]>(
    values: T
  ): ZodEnum<T> => {
    return new ZodEnum({
      t: ZodTypes.enum,
      values: values,
    }) as any;
  };
}
