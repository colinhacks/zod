import { ZodTypes } from "../ZodTypes.ts";
import { ZodType, ZodTypeAny, ZodTypeDef } from "./base.ts";

// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodRecordDef<Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  t: ZodTypes.record;
  valueType: Value;
}

export class ZodRecord<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Record<string, Value["_output"]>, // { [k in keyof T]: T[k]['_type'] },
  ZodRecordDef<Value>,
  Record<string, Value["_input"]>
> {
  readonly _value!: Value;

  toJSON = () => ({
    t: this._def.t,
    valueType: this._def.valueType.toJSON(),
  });

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value
  ): ZodRecord<Value> => {
    return new ZodRecord({
      t: ZodTypes.record,
      valueType,
    });
  };
}
