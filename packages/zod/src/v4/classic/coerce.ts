import * as core from "zod/v4/core";
import * as schemas from "./schemas.js";

export interface ZodCoercedString extends schemas._ZodString<unknown> {}
export function string(params?: string | core.$ZodStringParams): ZodCoercedString {
  return core._coercedString(schemas.ZodString, params);
}

export interface ZodCoercedNumber extends schemas._ZodNumber<unknown> {}
export function number(params?: string | core.$ZodNumberParams): ZodCoercedNumber {
  return core._coercedNumber(schemas.ZodNumber, params);
}

export interface ZodCoercedBoolean extends schemas._ZodBoolean<unknown> {}
export function boolean(params?: string | core.$ZodBooleanParams): ZodCoercedBoolean {
  return core._coercedBoolean(schemas.ZodBoolean, params);
}

export interface ZodCoercedBigInt extends schemas._ZodBigInt<unknown> {}
export function bigint(params?: string | core.$ZodBigIntParams): ZodCoercedBigInt {
  return core._coercedBigint(schemas.ZodBigInt, params);
}

export interface ZodCoercedDate extends schemas._ZodDate<unknown> {}
export function date(params?: string | core.$ZodDateParams): ZodCoercedDate {
  return core._coercedDate(schemas.ZodDate, params);
}
