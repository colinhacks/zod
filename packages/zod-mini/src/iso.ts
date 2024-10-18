import * as schemas from "./schemas.js";
import * as util from "./util.js";

// ZodMiniISODateTime
interface ZodMiniISODateTimeParams
  extends util.Params<
    schemas.ZodMiniISODateTime,
    "check" | "pattern" | "coerce" | "format"
  > {}

export const datetime: util.PrimitiveFactory<
  ZodMiniISODateTimeParams,
  schemas.ZodMiniISODateTime
> = util.factory(schemas.ZodMiniISODateTime, {
  type: "string",
  format: "iso_datetime",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});

// ZodMiniISODate
interface ZodMiniISODateParams
  extends util.Params<
    schemas.ZodMiniISODate,
    "check" | "pattern" | "coerce" | "format"
  > {}
export const date: util.PrimitiveFactory<
  ZodMiniISODateParams,
  schemas.ZodMiniISODate
> = util.factory(schemas.ZodMiniString, {
  type: "string",
  format: "iso_date",
  check: "string_format",
});

// ZodMiniISOTime
interface ZodMiniISOTimeParams
  extends util.Params<
    schemas.ZodMiniISOTime,
    "check" | "pattern" | "coerce" | "format"
  > {}
export const time: util.PrimitiveFactory<
  ZodMiniISOTimeParams,
  schemas.ZodMiniISOTime
> = util.factory(schemas.ZodMiniString, {
  type: "string",
  format: "iso_time",
  check: "string_format",
  offset: false,
  local: false,
  precision: null,
});
