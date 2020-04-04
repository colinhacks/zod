import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodRecordDef<Value extends z.ZodAny = z.ZodAny> extends z.ZodTypeDef {
  t: z.ZodTypes.record;
  valueType: Value;
}

export class ZodRecord<Value extends z.ZodAny = z.ZodAny> extends z.ZodType<
  Record<string, Value['_type']>, // { [k in keyof T]: T[k]['_type'] },
  ZodRecordDef<Value>
> {
  readonly _value!: Value;

  toJSON = () => ({
    t: this._def.t,
    valueType: this._def.valueType.toJSON(),
  });

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <Value extends z.ZodAny = z.ZodAny>(valueType: Value): ZodRecord<Value> => {
    return new ZodRecord({
      t: z.ZodTypes.record,
      valueType,
    });
  };
}
