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
