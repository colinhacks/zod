import * as $ from "zod-core";
import * as util from "./util.js";

export function lt<T extends $.Numeric>(
  value: T,
  params?: string | util.RawCheckParams
): $.$ZodCheckLessThan<T> {
  return new $.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function lte<T extends $.Numeric>(
  value: T,
  params?: string | util.RawCheckParams
): $.$ZodCheckLessThan<T> {
  return new $.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}

// $ZodCheckGreaterThan;
export function gt<T extends $.Numeric>(
  value: T,
  params?: string | util.RawCheckParams
): $.$ZodCheckGreaterThan<T> {
  return new $.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function gte<T extends $.Numeric>(
  value: T,
  params?: string | util.RawCheckParams
): $.$ZodCheckGreaterThan<T> {
  return new $.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}

// $ZodCheckMaxSize;
export function maxSize(
  maximum: number,
  params?: string | util.RawCheckParams
): $.$ZodCheckMaxSize<$.Sizeable> {
  return new $.$ZodCheckMaxSize({
    check: "max_size",
    ...util.normalizeCheckParams(params),
    maximum,
  });
}

// $ZodCheckMinSize;
export function minSize(
  minimum: number,
  params?: string | util.RawCheckParams
): $.$ZodCheckMinSize<$.Sizeable> {
  return new $.$ZodCheckMinSize({
    check: "min_size",
    ...util.normalizeCheckParams(params),
    minimum,
  });
}
// $ZodCheckRegex;
export function regex(
  pattern: RegExp,
  params?: string | util.RawCheckParams
): $.$ZodCheckRegex {
  return new $.$ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...util.normalizeCheckParams(params),
    pattern,
  });
}

// $ZodCheckIncludes;
export function includes(
  includes: string,
  params?: string | util.RawCheckParams
): $.$ZodCheckIncludes {
  return new $.$ZodCheckIncludes({
    check: "includes",
    ...util.normalizeCheckParams(params),
    includes,
  });
}

// $ZodCheckStartsWith;
export function startsWith(
  prefix: string,
  params?: string | util.RawCheckParams
): $.$ZodCheckStartsWith {
  return new $.$ZodCheckStartsWith({
    check: "starts_with",
    ...util.normalizeCheckParams(params),
    prefix,
  });
}

// $ZodCheckEndsWith;
export function endsWith(
  suffix: string,
  params?: string | util.RawCheckParams
): $.$ZodCheckEndsWith {
  return new $.$ZodCheckEndsWith({
    check: "ends_with",
    ...util.normalizeCheckParams(params),
    suffix,
  });
}

export function lowercase(
  params?: string | util.RawCheckParams
): $.$ZodCheckToLowerCase {
  return new $.$ZodCheckToLowerCase({
    check: "lowercase",
    ...util.normalizeCheckParams(params),
  });
}

export function uppercase(
  params?: string | util.RawCheckParams
): $.$ZodCheckToUpperCase {
  return new $.$ZodCheckToUpperCase({
    check: "uppercase",
    ...util.normalizeCheckParams(params),
  });
}

/////////////////////////////////////////
///////     STRING TRANSFORMS     ///////
/////////////////////////////////////////
// $ZodCheckTrim;
export function trim(params?: string | util.RawCheckParams): $.$ZodCheckTrim {
  return new $.$ZodCheckTrim({
    check: "trim",
    ...util.normalizeCheckParams(params),
  });
}

// $ZodCheckToLowerCase;
export function toLowerCase(
  params?: string | util.RawCheckParams
): $.$ZodCheckToLowerCase {
  return new $.$ZodCheckToLowerCase({
    check: "to_lowercase",
    ...util.normalizeCheckParams(params),
  });
}

// $ZodCheckToUpperCase;
export function toUpperCase(
  params?: string | util.RawCheckParams
): $.$ZodCheckToUpperCase {
  return new $.$ZodCheckToUpperCase({
    check: "to_uppercase",
    ...util.normalizeCheckParams(params),
  });
}

// $ZodCheckNormalize;
export function normalize(
  params?: string | util.RawCheckParams
): $.$ZodCheckNormalize {
  return new $.$ZodCheckNormalize({
    check: "normalize",
    ...util.normalizeCheckParams(params),
  });
}
