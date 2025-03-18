import * as core from "@zod/core";
import * as schemas from "./schemas.js";

export function string(params?: string | core.$ZodStringParams): schemas.ZodMiniString {
  return core._coercedString(schemas.ZodMiniString, params);
}

export function number(params?: string | core.$ZodNumberParams): schemas.ZodMiniNumber {
  return core._coercedNumber(schemas.ZodMiniNumber, params);
}

export function boolean(params?: string | core.$ZodBooleanParams): schemas.ZodMiniBoolean {
  return core._coercedBoolean(schemas.ZodMiniBoolean, params);
}

export function bigint(params?: string | core.$ZodBigIntParams): schemas.ZodMiniBigInt {
  return core._coercedBigint(schemas.ZodMiniBigInt, params);
}

export function date(params?: string | core.$ZodDateParams): schemas.ZodMiniDate {
  return core._coercedDate(schemas.ZodMiniDate, params);
}
