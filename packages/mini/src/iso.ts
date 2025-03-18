import * as core from "@zod/core";
// import type * as schemas from "./schemas.js";
import * as util from "@zod/core/util";
import * as schemas from "./schemas.js";

// $ZodISODateTime
export interface ZodMiniISODateTime extends schemas.ZodMiniStringFormat<"iso_datetime"> {
  _zod: core.$ZodISODateTimeInternals;
}
export const ZodMiniISODateTime: core.$constructor<ZodMiniISODateTime> = core.$constructor(
  "$ZodISODateTime",
  (inst, def) => {
    // inst._zod = new schemas.ZodMiniISODateTime(def);
    core.$ZodISODateTime.init(inst, def);
    schemas.ZodMiniStringFormat.init(inst, def);
  }
);
export type $ZodISODateTimeParams = util.StringFormatParams<core.$ZodISODateTime, "pattern">;

const _datetime = util.factory(() => ZodMiniISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
// overloads
export function datetime(checks?: core.$ZodCheck<string>[]): ZodMiniISODateTime;
export function datetime(
  params?: string | $ZodISODateTimeParams,
  checks?: core.$ZodCheck<string>[]
): ZodMiniISODateTime;
export function datetime(...args: any[]): ZodMiniISODateTime {
  return _datetime(...args);
}

// $ZodISODate

export interface ZodMiniISODate extends schemas.ZodMiniStringFormat<"iso_date"> {
  _zod: core.$ZodISODateInternals;
}
export const ZodMiniISODate: core.$constructor<ZodMiniISODate> = core.$constructor("$ZodISODate", (inst, def) => {
  // inst._zod = new schemas.ZodMiniISODate(def);
  core.$ZodISODate.init(inst, def);
  schemas.ZodMiniStringFormat.init(inst, def);
});
export type $ZodISODateParams = util.StringFormatParams<core.$ZodISODate, "pattern">;
const _date = util.factory(() => ZodMiniISODate, {
  type: "string",
  format: "iso_date",
  check: "string_format",
});
// overloads
export function date(checks?: core.$ZodCheck<string>[]): ZodMiniISODate;
export function date(params?: string | $ZodISODateParams, checks?: core.$ZodCheck<string>[]): ZodMiniISODate;
export function date(...args: any[]): ZodMiniISODate {
  return _date(...args);
}

// $ZodISOTime
export interface ZodMiniISOTime extends schemas.ZodMiniStringFormat<"iso_time"> {
  _zod: core.$ZodISOTimeInternals;
}
export const ZodMiniISOTime: core.$constructor<ZodMiniISOTime> = core.$constructor("$ZodISOTime", (inst, def) => {
  // inst._zod = new schemas.ZodMiniISOTime(def);
  core.$ZodISOTime.init(inst, def);
  schemas.ZodMiniStringFormat.init(inst, def);
});
export type $ZodISOTimeParams = util.StringFormatParams<core.$ZodISOTime, "pattern">;
const _time = util.factory(() => ZodMiniISOTime, {
  type: "string",
  format: "iso_time",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
// overloads
export function time(checks?: core.$ZodCheck<string>[]): ZodMiniISOTime;
export function time(params?: string | $ZodISOTimeParams, checks?: core.$ZodCheck<string>[]): ZodMiniISOTime;
export function time(...args: any[]): ZodMiniISOTime {
  return _time(...args);
}

// $ZodISODuration
export interface ZodMiniISODuration extends schemas.ZodMiniStringFormat<"duration"> {
  _zod: core.$ZodISODurationInternals;
}
export const ZodMiniISODuration: core.$constructor<ZodMiniISODuration> = core.$constructor(
  "$ZodISODuration",
  (inst, def) => {
    // inst._zod = new schemas.ZodMiniISODuration(def);
    core.$ZodISODuration.init(inst, def);
    schemas.ZodMiniStringFormat.init(inst, def);
  }
);

export type $ZodISODurationParams = util.StringFormatParams<core.$ZodISODuration, "pattern">;
const _duration = util.factory(() => ZodMiniISODuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});
// overloads
export function duration(checks?: core.$ZodCheck<string>[]): ZodMiniISODuration;
export function duration(
  params?: string | $ZodISODurationParams,
  checks?: core.$ZodCheck<string>[]
): ZodMiniISODuration;
export function duration(...args: any[]): ZodMiniISODuration {
  return _duration(...args);
}
