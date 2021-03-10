import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeAny, ZodTypeDef } from "./base";

export interface ZodMapDef<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  t: ZodTypes.map;
  valueType: Value;
  keyType: Key;
}

export class ZodMap<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Map<Key["_output"], Value["_output"]>,
  ZodMapDef<Key, Value>,
  Map<Key["_input"], Value["_input"]>
> {
  readonly _value!: Value;

  toJSON = () => ({
    t: this._def.t,
    valueType: this._def.valueType.toJSON(),
    keyType: this._def.keyType.toJSON(),
  });

  static create = <
    Key extends ZodTypeAny = ZodTypeAny,
    Value extends ZodTypeAny = ZodTypeAny
  >(
    keyType: Key,
    valueType: Value
  ): ZodMap<Key, Value> => {
    return new ZodMap({
      t: ZodTypes.map,
      valueType,
      keyType,
    });
  };
}
