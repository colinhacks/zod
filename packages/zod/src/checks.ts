export {
  _lt as lt,
  _lte as lte,
  _gt as gt,
  _gte as gte,
  _positive as positive,
  _negative as negative,
  _nonpositive as nonpositive,
  _nonnegative as nonnegative,
  _multipleOf as multipleOf,
  _maxSize as maxSize,
  _minSize as minSize,
  _size as size,
  _maxLength as maxLength,
  _minLength as minLength,
  _length as length,
  _regex as regex,
  _lowercase as lowercase,
  _uppercase as uppercase,
  _includes as includes,
  _startsWith as startsWith,
  _endsWith as endsWith,
  _property as property,
  _mime as mime,
  _overwrite as overwrite,
  _normalize as normalize,
  _trim as trim,
  _toLowerCase as toLowerCase,
  _toUpperCase as toUpperCase,
} from "@zod/core";

// import * as core from "@zod/core";
// import * as util from "@zod/core/util";

// export type $ZodCheckLessThanParams = util.CheckParams<core.$ZodCheckLessThan, "inclusive" | "value">;

// export function lt(value: util.Numeric, params?: string | $ZodCheckLessThanParams): core.$ZodCheckLessThan<util.Numeric> {
//   return new core.$ZodCheckLessThan({
//     check: "less_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function lte(value: util.Numeric, params?: string | $ZodCheckLessThanParams): core.$ZodCheckLessThan<util.Numeric> {
//   return new core.$ZodCheckLessThan({
//     check: "less_than",

//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }
// export {
//   /** @deprecated Use `z.lte()` instead. */
//   lte as max,
// };

// // ZodCheckGreaterThan

// export type $ZodCheckGreaterThanParams = util.CheckParams<core.$ZodCheckGreaterThan, "inclusive" | "value">;

// export function gt(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): core.$ZodCheckGreaterThan {
//   return new core.$ZodCheckGreaterThan({
//     check: "greater_than",

//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function gte(value: util.Numeric, params?: string | $ZodCheckGreaterThanParams): core.$ZodCheckGreaterThan {
//   return new core.$ZodCheckGreaterThan({
//     check: "greater_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }

// export {
//   /** @deprecated Use `z.gte()` instead. */
//   gte as min,
// };

// export function positive(params?: string | $ZodCheckGreaterThanParams): core.$ZodCheckGreaterThan {
//   return gt(0, params);
// }

// // negative
// export function negative(params?: string | $ZodCheckLessThanParams): core.$ZodCheckLessThan {
//   return lt(0, params);
// }

// // nonpositive
// export function nonpositive(params?: string | $ZodCheckLessThanParams): core.$ZodCheckLessThan {
//   return lte(0, params);
// }

// // nonnegative
// export function nonnegative(params?: string | $ZodCheckGreaterThanParams): core.$ZodCheckGreaterThan {
//   return gte(0, params);
// }

// export type $ZodCheckMultipleOfParams = util.CheckParams<core.$ZodCheckMultipleOf, "value">;
// export function multipleOf(value: number | bigint, params?: string | $ZodCheckMultipleOfParams): core.$ZodCheckMultipleOf {
//   return new core.$ZodCheckMultipleOf({
//     check: "multiple_of",

//     ...util.normalizeCheckParams(params),
//     value,
//   });
// }

// export type $ZodCheckMaxSizeParams = util.CheckParams<core.$ZodCheckMaxSize, "maximum">;

// export function maxSize(maximum: number, params?: string | $ZodCheckMaxSizeParams): core.$ZodCheckMaxSize<util.HasSize> {
//   return new core.$ZodCheckMaxSize({
//     check: "max_size",
//     ...util.normalizeCheckParams(params),
//     maximum,
//   });
// }

// export type $ZodCheckMinSizeParams = util.CheckParams<core.$ZodCheckMinSize, "minimum">;
// export function minSize(minimum: number, params?: string | $ZodCheckMinSizeParams): core.$ZodCheckMinSize<util.HasSize> {
//   return new core.$ZodCheckMinSize({
//     check: "min_size",
//     ...util.normalizeCheckParams(params),
//     minimum,
//   });
// }

// export type $ZodCheckSizeEqualsParams = util.CheckParams<core.$ZodCheckSizeEquals, "size">;
// export function size(size: number, params?: string | $ZodCheckSizeEqualsParams): core.$ZodCheckSizeEquals<util.HasSize> {
//   return new core.$ZodCheckSizeEquals({
//     check: "size_equals",
//     ...util.normalizeCheckParams(params),
//     size,
//   });
// }

// export type $ZodCheckMaxLengthParams = util.CheckParams<core.$ZodCheckMaxLength, "maximum">;

// export function maxLength(
//   maximum: number,
//   params?: string | $ZodCheckMaxLengthParams
// ): core.$ZodCheckMaxLength<util.HasLength> {
//   const ch = new core.$ZodCheckMaxLength({
//     check: "max_length",
//     ...util.normalizeCheckParams(params),
//     maximum,
//   });
//   return ch;
// }
// export type $ZodCheckMinLengthParams = util.CheckParams<core.$ZodCheckMinLength, "minimum">;
// export function minLength(
//   minimum: number,
//   params?: string | $ZodCheckMinLengthParams
// ): core.$ZodCheckMinLength<util.HasLength> {
//   return new core.$ZodCheckMinLength({
//     check: "min_length",
//     ...util.normalizeCheckParams(params),
//     minimum,
//   });
// }

// export type $ZodCheckLengthEqualsParams = util.CheckParams<core.$ZodCheckLengthEquals, "length">;
// export function length(
//   length: number,
//   params?: string | $ZodCheckLengthEqualsParams
// ): core.$ZodCheckLengthEquals<util.HasLength> {
//   return new core.$ZodCheckLengthEquals({
//     check: "length_equals",
//     ...util.normalizeCheckParams(params),
//     length,
//   });
// }

// export type $ZodCheckRegexParams = util.CheckParams<core.$ZodCheckRegex, "format" | "pattern">;
// export function regex(pattern: RegExp, params?: string | $ZodCheckRegexParams): core.$ZodCheckRegex {
//   return new core.$ZodCheckRegex({
//     check: "string_format",
//     format: "regex",
//     ...util.normalizeCheckParams(params),
//     pattern,
//   });
// }

// export type $ZodCheckLowerCaseParams = util.CheckParams<core.$ZodCheckLowerCase, "format">;

// export function lowercase(params?: string | $ZodCheckLowerCaseParams): core.$ZodCheckLowerCase {
//   return new core.$ZodCheckLowerCase({
//     check: "string_format",
//     format: "lowercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// export type $ZodCheckUpperCaseParams = util.CheckParams<core.$ZodCheckUpperCase, "format">;

// export function uppercase(params?: string | $ZodCheckUpperCaseParams): core.$ZodCheckUpperCase {
//   return new core.$ZodCheckUpperCase({
//     check: "string_format",
//     format: "uppercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// export type $ZodCheckIncludesParams = util.CheckParams<core.$ZodCheckIncludes, "includes" | "format" | "pattern">;
// export function includes(includes: string, params?: string | $ZodCheckIncludesParams): core.$ZodCheckIncludes {
//   return new core.$ZodCheckIncludes({
//     check: "string_format",
//     format: "includes",
//     ...util.normalizeCheckParams(params),
//     includes,
//   });
// }
// export type $ZodCheckStartsWithParams = util.CheckParams<core.$ZodCheckStartsWith, "prefix" | "format" | "pattern">;
// export function startsWith(prefix: string, params?: string | $ZodCheckStartsWithParams): core.$ZodCheckStartsWith {
//   return new core.$ZodCheckStartsWith({
//     check: "string_format",
//     format: "starts_with",
//     ...util.normalizeCheckParams(params),
//     prefix,
//   });
// }

// export type $ZodCheckEndsWithParams = util.CheckParams<core.$ZodCheckEndsWith, "suffix" | "format" | "pattern">;

// export function endsWith(suffix: string, params?: string | $ZodCheckEndsWithParams): core.$ZodCheckEndsWith {
//   return new core.$ZodCheckEndsWith({
//     check: "string_format",
//     format: "ends_with",
//     ...util.normalizeCheckParams(params),
//     suffix,
//   });
// }

// export type $ZodCheckPropertyParams = util.CheckParams<core.$ZodCheckProperty, "property" | "schema">;
// export function property<K extends string, T extends core.$ZodType>(
//   property: K,
//   schema: T,
//   params?: string | $ZodCheckPropertyParams
// ): core.$ZodCheckProperty<{ [k in K]: core.output<T> }> {
//   return new core.$ZodCheckProperty({
//     check: "property",
//     property,
//     schema,
//     ...util.normalizeCheckParams(params),
//   });
// }

// export type $ZodCheckMimeTypeParams = util.CheckParams<core.$ZodCheckMimeType, "mime">;
// export function mime(types: util.MimeTypes[], params?: string | $ZodCheckMimeTypeParams) {
//   return new core.$ZodCheckMimeType({
//     check: "mime_type",
//     mime: types,
//     ...util.normalizeCheckParams(params),
//   });
// }

// export function overwrite<T>(tx: (input: T) => T): core.$ZodCheckOverwrite<T> {
//   return new core.$ZodCheckOverwrite({
//     check: "overwrite",
//     tx,
//   }) as core.$ZodCheckOverwrite<T>;
// }
// // normalize
// export function normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): core.$ZodCheckOverwrite<string> {
//   return overwrite((input) => input.normalize(form));
// }

// // trim
// export function trim(): core.$ZodCheckOverwrite<string> {
//   return overwrite((input) => input.trim());
// }
// // toLowerCase
// export function toLowerCase(): core.$ZodCheckOverwrite<string> {
//   return overwrite((input) => input.toLowerCase());
// }
// // toUpperCase
// export function toUpperCase(): core.$ZodCheckOverwrite<string> {
//   return overwrite((input) => input.toUpperCase());
// }
