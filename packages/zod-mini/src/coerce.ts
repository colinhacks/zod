import * as mini from "./schemas.js";
import * as util from "./util.js";

interface ZodMiniStringParams
  extends util.Params<mini.ZodMiniString, "coerce"> {}
export const string: util.PrimitiveFactory<
  ZodMiniStringParams,
  mini.ZodMiniString
> = util.factory<ZodMiniStringParams, mini.ZodMiniString>(mini.ZodMiniString, {
  type: "string",
  coerce: true,
});

interface ZodMiniNumberParams
  extends util.Params<mini.ZodMiniNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  ZodMiniNumberParams,
  mini.ZodMiniNumber
> = util.factory(mini.ZodMiniNumber, { type: "number", coerce: true });

//////////    ZodMiniBoolean    //////////
interface ZodMiniBooleanParams extends util.Params<mini.ZodMiniBoolean> {}
export const boolean: util.PrimitiveFactory<
  ZodMiniBooleanParams,
  mini.ZodMiniBoolean
> = util.factory(mini.ZodMiniBoolean, { type: "boolean", coerce: true });

//////////    ZodMiniBigInt    //////////
interface ZodMiniBigIntParams extends util.Params<mini.ZodMiniBigInt> {}
export const bigint: util.PrimitiveFactory<
  ZodMiniBigIntParams,
  mini.ZodMiniBigInt
> = util.factory(mini.ZodMiniBigInt, { type: "bigint", coerce: true });

//////////    ZodMiniDate    //////////
interface ZodMiniDateParams extends util.Params<mini.ZodMiniDate> {}
export const date: util.PrimitiveFactory<ZodMiniDateParams, mini.ZodMiniDate> =
  util.factory(mini.ZodMiniDate, { type: "date", coerce: true });
