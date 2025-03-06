import type * as api from "./api.js";
import type * as base from "./base.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

const _string = util.factory(() => schemas.$ZodString, {
  type: "string",
  coerce: true,
});

export function string(checks?: base.$ZodCheck<string>[]): schemas.$ZodString;
export function string(params?: string | api.$ZodStringParams, checks?: base.$ZodCheck<string>[]): schemas.$ZodString;
export function string(...args: any[]): schemas.$ZodString {
  return _string(...args);
}

const _number = util.factory(() => schemas.$ZodNumber, {
  type: "number",
  coerce: true,
});

export function number(checks?: base.$ZodCheck<number>[]): schemas.$ZodNumber;
export function number(params?: string | api.$ZodNumberParams, checks?: base.$ZodCheck<number>[]): schemas.$ZodNumber;
export function number(...args: any[]): schemas.$ZodNumber {
  return _number(...args);
}

/** Use `z.stringbool()` to convert strings to boolean. */
const _boolean = util.factory(() => schemas.$ZodBoolean, {
  type: "boolean",
  coerce: true,
});

export function boolean(checks?: base.$ZodCheck<boolean>[]): schemas.$ZodBoolean;
export function boolean(
  params?: string | api.$ZodBooleanParams,
  checks?: base.$ZodCheck<boolean>[]
): schemas.$ZodBoolean;
export function boolean(...args: any[]): schemas.$ZodBoolean {
  return _boolean(...args);
}

const _bigint = util.factory(() => schemas.$ZodBigInt, {
  type: "bigint",
  coerce: true,
});

export function bigint(checks?: base.$ZodCheck<bigint>[]): schemas.$ZodBigInt;
export function bigint(params?: string | api.$ZodBigIntParams, checks?: base.$ZodCheck<bigint>[]): schemas.$ZodBigInt;
export function bigint(...args: any[]): schemas.$ZodBigInt {
  return _bigint(...args);
}

const _date = util.factory(() => schemas.$ZodDate, {
  type: "date",
  coerce: true,
});

export function date(checks?: base.$ZodCheck<Date>[]): schemas.$ZodDate;
export function date(params?: string | api.$ZodDateParams, checks?: base.$ZodCheck<Date>[]): schemas.$ZodDate;
export function date(...args: any[]): schemas.$ZodDate {
  return _date(...args);
}
