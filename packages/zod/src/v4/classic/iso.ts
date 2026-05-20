import * as core from "../core/index.js";
import { ZodISODate, ZodISODateTime, ZodISODuration, ZodISOTime } from "./schemas.js";

export { ZodISODate, ZodISODateTime, ZodISODuration, ZodISOTime } from "./schemas.js";

export function datetime(params?: string | core.$ZodISODateTimeParams): ZodISODateTime {
  return core._isoDateTime(ZodISODateTime, params);
}

export function date(params?: string | core.$ZodISODateParams): ZodISODate {
  return core._isoDate(ZodISODate, params);
}

export function time(params?: string | core.$ZodISOTimeParams): ZodISOTime {
  return core._isoTime(ZodISOTime, params);
}

export function duration(params?: string | core.$ZodISODurationParams): ZodISODuration {
  return core._isoDuration(ZodISODuration, params);
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////    ZodISOYearMonth       //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISOYearMonth extends schemas.ZodStringFormat {
  _zod: core.$ZodISOYearMonthInternals;
}
export const ZodISOYearMonth: core.$constructor<ZodISOYearMonth> = /*@__PURE__*/ core.$constructor(
  "ZodISOYearMonth",
  (inst, def) => {
    core.$ZodISOYearMonth.init(inst, def);
    schemas.ZodStringFormat.init(inst, def);
  }
);

export function yearMonth(params?: string | core.$ZodISOYearMonthParams): ZodISOYearMonth {
  return core._isoYearMonth(ZodISOYearMonth, params);
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////     ZodISOMonthDay       //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISOMonthDay extends schemas.ZodStringFormat {
  _zod: core.$ZodISOMonthDayInternals;
}
export const ZodISOMonthDay: core.$constructor<ZodISOMonthDay> = /*@__PURE__*/ core.$constructor(
  "ZodISOMonthDay",
  (inst, def) => {
    core.$ZodISOMonthDay.init(inst, def);
    schemas.ZodStringFormat.init(inst, def);
  }
);

export function monthDay(params?: string | core.$ZodISOMonthDayParams): ZodISOMonthDay {
  return core._isoMonthDay(ZodISOMonthDay, params);
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////                          //////////
//////////      ZodISOInstant       //////////
//////////                          //////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export interface ZodISOInstant extends schemas.ZodStringFormat {
  _zod: core.$ZodISOInstantInternals;
}
export const ZodISOInstant: core.$constructor<ZodISOInstant> = /*@__PURE__*/ core.$constructor(
  "ZodISOInstant",
  (inst, def) => {
    core.$ZodISOInstant.init(inst, def);
    schemas.ZodStringFormat.init(inst, def);
  }
);

export function instant(params?: string | core.$ZodISOInstantParams): ZodISOInstant {
  return core._isoInstant(ZodISOInstant, params);
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////                              //////////
//////////    ZodISOZonedDateTime       //////////
//////////                              //////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

export interface ZodISOZonedDateTime extends schemas.ZodStringFormat {
  _zod: core.$ZodISOZonedDateTimeInternals;
}
export const ZodISOZonedDateTime: core.$constructor<ZodISOZonedDateTime> = /*@__PURE__*/ core.$constructor(
  "ZodISOZonedDateTime",
  (inst, def) => {
    core.$ZodISOZonedDateTime.init(inst, def);
    schemas.ZodStringFormat.init(inst, def);
  }
);

export function zonedDateTime(params?: string | core.$ZodISOZonedDateTimeParams): ZodISOZonedDateTime {
  return core._isoZonedDateTime(ZodISOZonedDateTime, params);
}
