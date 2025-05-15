import * as core from "zod/v4/core";
import * as schemas from "./schemas.js";

export function string(params?: string | core.$ZodStringParams): schemas.ZodMiniString<unknown> {
  return core._coercedString(schemas.ZodMiniString, params);
}

export function number(params?: string | core.$ZodNumberParams): schemas.ZodMiniNumber<unknown> {
  return core._coercedNumber(schemas.ZodMiniNumber, params);
}

export function boolean(params?: string | core.$ZodBooleanParams): schemas.ZodMiniBoolean<unknown> {
  return core._coercedBoolean(schemas.ZodMiniBoolean, params);
}

export function bigint(params?: string | core.$ZodBigIntParams): schemas.ZodMiniBigInt<unknown> {
  return core._coercedBigint(schemas.ZodMiniBigInt, params);
}

export function date(params?: string | core.$ZodDateParams): schemas.ZodMiniDate<unknown> {
  return core._coercedDate(schemas.ZodMiniDate, params);
}
