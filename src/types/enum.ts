import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodLiteral } from './literal';

export type ArrayKeys = keyof any[];
export type Indices<T> = Exclude<keyof T, ArrayKeys>;
type EnumValues = [ZodLiteral<string>, ...ZodLiteral<string>[]];
type StringValues<T extends EnumValues> = {
  [k in Indices<T>]: T[k] extends ZodLiteral<infer U> ? (U extends string ? U : never) : never;
}[Indices<T>];

export interface ZodEnumDef<T extends EnumValues = EnumValues> extends z.ZodTypeDef {
  t: z.ZodTypes.enum;
  values: T;
}

export class ZodEnum<T extends EnumValues = EnumValues> extends z.ZodType<T[number]['_type'], ZodEnumDef<T>> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  get Values(): { [k in StringValues<T>]: k } {
    const enumValues: any = {};
    for (const lit of this._def.values) {
      enumValues[lit._def.value] = lit._def.value;
    }
    return enumValues as any;
  }

  static create = <T extends EnumValues>(values: T): ZodEnum<T> => {
    return new ZodEnum({
      t: z.ZodTypes.enum,
      values: values,
    });
  };
}
