import * as z from "./base";
import { ZodTypes } from "../ZodTypes"

export interface ZodMapDef<
  Key extends z.ZodTypeAny = z.ZodTypeAny,
  Value extends z.ZodTypeAny = z.ZodTypeAny
> extends z.ZodTypeDef {
  t: ZodTypes.map;
  valueType: Value;
  keyType: Key;
}

export class ZodMap<
  Key extends z.ZodTypeAny = z.ZodTypeAny,
  Value extends z.ZodTypeAny = z.ZodTypeAny
> extends z.ZodType<
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
    Key extends z.ZodTypeAny = z.ZodTypeAny,
    Value extends z.ZodTypeAny = z.ZodTypeAny
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
