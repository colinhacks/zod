import * as core from "@zod/core";
import * as util from "@zod/core/util";
import * as schemas from "./schemas.js";

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodISODateTime      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISODateTime extends schemas.ZodStringFormat {
  _zod: core.$ZodISODateTimeInternals;
}
export const ZodISODateTime: core.$constructor<ZodISODateTime> = /*@__PURE__*/ core.$constructor("ZodISODateTime", (inst, def) => {
  core.$ZodISODateTime.init(inst, def);
  schemas.ZodStringFormat.init(inst, def);
});

const _datetime = util.factory(() => ZodISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
export function datetime(checks?: core.$ZodCheck<string>[]): ZodISODateTime;
export function datetime(params?: string | core.$ZodISODateTimeParams, checks?: core.$ZodCheck<string>[]): ZodISODateTime;
export function datetime(...args: any[]): ZodISODateTime {
  return _datetime(...args);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodISODate      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodISODate extends schemas.ZodStringFormat {
  _zod: core.$ZodISODateInternals;
}
export const ZodISODate: core.$constructor<ZodISODate> = /*@__PURE__*/ core.$constructor("ZodISODate", (inst, def) => {
  core.$ZodISODate.init(inst, def);
  schemas.ZodStringFormat.init(inst, def);
});

const _date = util.factory(() => ZodISODate, {
  type: "string",
  format: "iso_date",
  check: "string_format",
});
export function date(checks?: core.$ZodCheck<string>[]): ZodISODate;
export function date(params?: string | core.$ZodISODateParams, checks?: core.$ZodCheck<string>[]): ZodISODate;
export function date(...args: any[]): ZodISODate {
  return _date(...args);
}

// ZodISOTime

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodISOTime      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface ZodISOTime extends schemas.ZodStringFormat {
  _zod: core.$ZodISOTimeInternals;
}
export const ZodISOTime: core.$constructor<ZodISOTime> = /*@__PURE__*/ core.$constructor("ZodISOTime", (inst, def) => {
  core.$ZodISOTime.init(inst, def);
  schemas.ZodStringFormat.init(inst, def);
});

const _time = util.factory(() => ZodISOTime, {
  type: "string",
  format: "iso_time",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
export function time(checks?: core.$ZodCheck<string>[]): ZodISOTime;
export function time(params?: string | core.$ZodISOTimeParams, checks?: core.$ZodCheck<string>[]): ZodISOTime;
export function time(...args: any[]): ZodISOTime {
  return _time(...args);
}

// ZodISODuration

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodISODuration      //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISODuration extends schemas.ZodStringFormat {
  _zod: core.$ZodISODurationInternals;
}
export const ZodISODuration: core.$constructor<ZodISODuration> = /*@__PURE__*/ core.$constructor("ZodISODuration", (inst, def) => {
  core.$ZodISODuration.init(inst, def);
  schemas.ZodStringFormat.init(inst, def);
});

const _duration = util.factory(() => ZodISODuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});
export function duration(checks?: core.$ZodCheck<string>[]): ZodISODuration;
export function duration(params?: string | core.$ZodISODurationParams, checks?: core.$ZodCheck<string>[]): ZodISODuration;
export function duration(...args: any[]): ZodISODuration {
  return _duration(...args);
}
