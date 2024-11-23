import * as schemas from "./schemas.js";
import * as util from "./util.js";

// $ZodISODateTime
interface $ZodISODateTimeParams
  extends util.StringFormatParams<
    schemas.$ZodISODateTime,
    "pattern" | "coerce"
  > {}

export const datetime: util.PrimitiveFactory<
  $ZodISODateTimeParams,
  schemas.$ZodISODateTime
> = util.factory(schemas.$ZodISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});

// $ZodISODate
interface $ZodISODateParams
  extends util.StringFormatParams<schemas.$ZodISODate, "pattern" | "coerce"> {}
export const date: util.PrimitiveFactory<
  $ZodISODateParams,
  schemas.$ZodISODate
> = util.factory(schemas.$ZodISODate, {
  type: "string",
  format: "iso_date",
  check: "string_format",
});

// $ZodISOTime
interface $ZodISOTimeParams
  extends util.StringFormatParams<schemas.$ZodISOTime, "pattern" | "coerce"> {}
export const time: util.PrimitiveFactory<
  $ZodISOTimeParams,
  schemas.$ZodISOTime
> = util.factory(schemas.$ZodISOTime, {
  type: "string",
  format: "iso_time",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});

// $ZodISODuration
interface $ZodISODurationParams
  extends util.StringFormatParams<
    schemas.$ZodISODuration,
    "coerce" | "pattern"
  > {}
export const duration: util.PrimitiveFactory<
  $ZodISODurationParams,
  schemas.$ZodISODuration
> = util.factory(schemas.$ZodISODuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});
