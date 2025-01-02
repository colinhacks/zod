import type * as core from "zod-core";
import * as util from "zod-core/util";
import * as schemas from "./schemas.js";

// ZodISODateTime
export interface ZodISODateTimeParams
  extends util.StringFormatParams<schemas.ZodISODateTime, "pattern"> {}

const _datetime = util.factory(() => schemas.ZodISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
export function datetime(
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISODateTime;
export function datetime(
  params?: string | ZodISODateTimeParams,
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISODateTime;
export function datetime(...args: any[]): schemas.ZodISODateTime {
  return _datetime(...args);
}

// ZodISODate
export interface ZodISODateParams
  extends util.StringFormatParams<schemas.ZodISODate, "pattern"> {}
const _date = util.factory(() => schemas.ZodISODate, {
  type: "string",
  format: "iso_date",
  check: "string_format",
});
export function date(checks?: core.$ZodCheck<string>[]): schemas.ZodISODate;
export function date(
  params?: string | ZodISODateParams,
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISODate;
export function date(...args: any[]): schemas.ZodISODate {
  return _date(...args);
}

// ZodISOTime
export interface ZodISOTimeParams
  extends util.StringFormatParams<schemas.ZodISOTime, "pattern"> {}
const _time = util.factory(() => schemas.ZodISOTime, {
  type: "string",
  format: "iso_time",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
export function time(checks?: core.$ZodCheck<string>[]): schemas.ZodISOTime;
export function time(
  params?: string | ZodISOTimeParams,
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISOTime;
export function time(...args: any[]): schemas.ZodISOTime {
  return _time(...args);
}

// ZodISODuration
export interface ZodISODurationParams
  extends util.StringFormatParams<schemas.ZodISODuration, "pattern"> {}
const _duration = util.factory(() => schemas.ZodISODuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});
export function duration(
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISODuration;
export function duration(
  params?: string | ZodISODurationParams,
  checks?: core.$ZodCheck<string>[]
): schemas.ZodISODuration;
export function duration(...args: any[]): schemas.ZodISODuration {
  return _duration(...args);
}
