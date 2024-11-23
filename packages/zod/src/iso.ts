import * as util from "zod-core/util";
import * as schemas from "./schemas.js";

// ZodISODateTime
interface ZodISODateTimeParams
  extends util.TypeParams<
    schemas.ZodISODateTime,
    "check" | "pattern" | "coerce" | "format"
  > {}

export const datetime: util.PrimitiveFactory<
  ZodISODateTimeParams,
  schemas.ZodISODateTime
> = util.factory(schemas.ZodISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});

// ZodISODate
interface ZodISODateParams
  extends util.TypeParams<
    schemas.ZodISODate,
    "check" | "pattern" | "coerce" | "format"
  > {}
export const date: util.PrimitiveFactory<ZodISODateParams, schemas.ZodISODate> =
  util.factory(schemas.ZodISODate, {
    type: "string",
    format: "iso_date",
    check: "string_format",
  });

// ZodISOTime
interface ZodISOTimeParams
  extends util.TypeParams<
    schemas.ZodISOTime,
    "check" | "pattern" | "coerce" | "format"
  > {}
export const time: util.PrimitiveFactory<ZodISOTimeParams, schemas.ZodISOTime> =
  util.factory(schemas.ZodISOTime, {
    type: "string",
    format: "iso_time",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
  });

// ZodISODuration
interface ZodISODurationParams
  extends util.TypeParams<
    schemas.ZodISODuration,
    "check" | "pattern" | "coerce" | "format"
  > {}
export const duration: util.PrimitiveFactory<
  ZodISODurationParams,
  schemas.ZodISODuration
> = util.factory(schemas.ZodISODuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});
