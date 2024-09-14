import {
  type $ZodCheckStringFormatParams,
  normalizeCheckParams,
} from "./api.js";
import * as checks from "./checks.js";
export function datetime(
  params?: string | $ZodCheckStringFormatParams
): checks.$ZodCheckISODateTime {
  return new checks.$ZodCheckISODateTime({
    ...normalizeCheckParams(params),
  });
}

export function date(
  params?: string | $ZodCheckStringFormatParams
): checks.$ZodCheckISODate {
  return new checks.$ZodCheckISODate({
    ...normalizeCheckParams(params),
  });
}
export function time(
  params?: string | $ZodCheckStringFormatParams
): checks.$ZodCheckISOTime {
  return new checks.$ZodCheckISOTime({
    ...normalizeCheckParams(params),
  });
}
