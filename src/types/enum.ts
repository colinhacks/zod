/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

type EnumValues = [string, ...string[]];

type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};

export interface ZodEnumDef<T extends EnumValues = EnumValues> extends z.ZodTypeDef {
  t: z.ZodTypes.enum;
  values: T;
}

export class ZodEnum<T extends [string, ...string[]]> extends z.ZodType<T[number], ZodEnumDef<T>> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  get OptionsList() {
    return this._def.values;
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
  static create = <U extends string, T extends [U, ...U[]]>(values: T): ZodEnum<T> => {
    return new ZodEnum({
      t: z.ZodTypes.enum,
      values,
    }) as any;
  };
}
