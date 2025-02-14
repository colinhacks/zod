import type * as core from "@zod/core";
import * as util from "@zod/core/util";
import * as schemas from "./schemas.js";
//////////    ZodCoercedString    //////////

const _string = util.factory(() => schemas.ZodString, {
  type: "string",
  coerce: true,
});
export function string(checks?: core.$ZodCheck<string>[]): schemas.ZodString;
export function string(params?: string | core.$ZodStringParams, checks?: core.$ZodCheck<string>[]): schemas.ZodString;
export function string(...args: any[]): schemas.ZodString {
  return _string(...args);
}

const _number = util.factory(() => schemas.ZodNumber, {
  type: "number",
  coerce: true,
});
export function number(checks?: core.$ZodCheck<number>[]): schemas.ZodNumber;
export function number(params?: string | core.$ZodNumberParams, checks?: core.$ZodCheck<number>[]): schemas.ZodNumber;
export function number(...args: any[]): schemas.ZodNumber {
  return _number(...args);
}

const _boolean = util.factory(() => schemas.ZodBoolean, {
  type: "boolean",
  coerce: true,
});
export function boolean(checks?: core.$ZodCheck<boolean>[]): schemas.ZodBoolean;
export function boolean(
  params?: string | core.$ZodBooleanParams,
  checks?: core.$ZodCheck<boolean>[]
): schemas.ZodBoolean;
export function boolean(...args: any[]): schemas.ZodBoolean {
  return _boolean(...args);
}

const _bigint = util.factory(() => schemas.ZodBigInt, {
  type: "bigint",
  coerce: true,
});
export function bigint(checks?: core.$ZodCheck<bigint>[]): schemas.ZodBigInt;
export function bigint(params?: string | core.$ZodBigIntParams, checks?: core.$ZodCheck<bigint>[]): schemas.ZodBigInt;
export function bigint(...args: any[]): schemas.ZodBigInt {
  return _bigint(...args);
}

const _date = util.factory(() => schemas.ZodDate, {
  type: "date",
  coerce: true,
});
export function date(checks?: core.$ZodCheck<Date>[]): schemas.ZodDate;
export function date(params?: string | core.$ZodDateParams, checks?: core.$ZodCheck<Date>[]): schemas.ZodDate;
export function date(...args: any[]): schemas.ZodDate {
  return _date(...args);
}
