import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodString } from './string';
import { ZodNumber } from './number';

type RecordKey = ZodString | ZodNumber;

export interface ZodRecordDef<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.record;
  keyType: Key;
  valueType: Value;
}

type ZodRecordType<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny> = Key extends ZodString
  ? Key extends ZodNumber
    ? Record<string | number, Value['_type']>
    : Record<string, Value['_type']> & { [k: number]: never }
  : Key extends ZodNumber
  ? Record<number, Value['_type']> & { [k: string]: never }
  : never;

export class ZodRecord<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodType<
  ZodRecordType<Key, Value>, // { [k in keyof T]: T[k]['_type'] },
  ZodRecordDef<Key, Value>
> {
  readonly _key!: Key;
  readonly _value!: Value;

  toJSON = () => ({
    t: this._def.t,
    keyType: this._def.keyType.toJSON(),
    valueType: this._def.valueType.toJSON(),
  });

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny>(
    keyType: Key,
    valueType: Value,
  ): ZodRecord<Key, Value> => {
    return new ZodRecord({
      t: z.ZodTypes.record,
      keyType,
      valueType,
    });
  };
}
