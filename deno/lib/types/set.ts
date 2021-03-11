import { ZodTypes } from "../ZodTypes.ts";
import { ZodType, ZodTypeAny, ZodTypeDef } from "./base.ts";

export interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  t: ZodTypes.set;
  valueType: Value;
}

export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  readonly _value!: Value;

  toJSON = () => ({
    t: this._def.t,
    valueType: this._def.valueType.toJSON(),
  });

  static create = <Value extends ZodTypeAny = ZodTypeAny>(
    valueType: Value
  ): ZodSet<Value> => {
    return new ZodSet({
      t: ZodTypes.set,
      valueType,
    });
  };
}
