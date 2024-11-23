// import * as core from "zod-core";
// import * as util from "zod-core/util";

// export function lt<T extends util.Numeric>(
//   value: T,
//   params?: string | util.CheckParams
// ): core.$ZodCheckLessThan<util.Numeric> {
//   return new core.$ZodCheckLessThan({
//     check: "less_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function lte(
//   value: util.Numeric,
//   params?: string | util.CheckParams
// ): core.$ZodCheckLessThan<util.Numeric> {
//   return new core.$ZodCheckLessThan({
//     check: "less_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }

// // type Params = string | util.CheckParams;
// // export function gt(
// //   value: number,
// //   params?: Params
// // ): core.$ZodCheckGreaterThan<number>;
// // export function gt(
// //   value: bigint,
// //   params?: Params
// // ): core.$ZodCheckGreaterThan<bigint>;
// // export function gt(value: Date, params?: Params): core.$ZodCheckGreaterThan<Date>;
// export function gt(
//   value: util.Numeric,
//   params?: string | util.CheckParams
// ): core.$ZodCheckGreaterThan {
//   return new core.$ZodCheckGreaterThan({
//     check: "greater_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function gte<T extends util.Numeric>(
//   value: T,
//   params?: string | util.CheckParams
// ): core.$ZodCheckGreaterThan<T> {
//   return new core.$ZodCheckGreaterThan({
//     check: "greater_than",
//     ...util.normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }

// export function maxSize(
//   maximum: number,
//   params?: string | util.CheckParams
// ): core.$ZodCheckMaxSize<util.Sizeable> {
//   return new core.$ZodCheckMaxSize({
//     check: "max_size",
//     ...util.normalizeCheckParams(params),
//     maximum,
//   });
// }

// export function minSize(
//   minimum: number,
//   params?: string | util.CheckParams
// ): core.$ZodCheckMinSize<util.Sizeable> {
//   return new core.$ZodCheckMinSize({
//     check: "min_size",
//     ...util.normalizeCheckParams(params),
//     minimum,
//   });
// }

// export function size(
//   size: number,
//   params?: string | util.CheckParams
// ): core.$ZodCheckSizeEquals<util.Sizeable> {
//   return new core.$ZodCheckSizeEquals({
//     check: "size_equals",
//     ...util.normalizeCheckParams(params),
//     size,
//   });
// }

// export function regex(
//   pattern: RegExp,
//   params?: string | util.CheckParams
// ): core.$ZodCheckRegex {
//   return new core.$ZodCheckRegex({
//     check: "string_format",
//     format: "regex",
//     ...util.normalizeCheckParams(params),
//     pattern,
//   });
// }

// export function includes(
//   includes: string,
//   params?: string | util.CheckParams
// ): core.$ZodCheckIncludes {
//   return new core.$ZodCheckIncludes({
//     check: "includes",
//     ...util.normalizeCheckParams(params),
//     includes,
//   });
// }

// export function startsWith(
//   prefix: string,
//   params?: string | util.CheckParams
// ): core.$ZodCheckStartsWith {
//   return new core.$ZodCheckStartsWith({
//     check: "starts_with",
//     ...util.normalizeCheckParams(params),
//     prefix,
//   });
// }

// export function endsWith(
//   suffix: string,
//   params?: string | util.CheckParams
// ): core.$ZodCheckEndsWith {
//   return new core.$ZodCheckEndsWith({
//     check: "ends_with",
//     ...util.normalizeCheckParams(params),
//     suffix,
//   });
// }

// export function lowercase(
//   params?: string | util.CheckParams
// ): core.$ZodCheckToLowerCase {
//   return new core.$ZodCheckToLowerCase({
//     check: "lowercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// export function uppercase(
//   params?: string | util.CheckParams
// ): core.$ZodCheckToUpperCase {
//   return new core.$ZodCheckToUpperCase({
//     check: "uppercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// /////////////////////////////////////////
// ///////     STRING TRANSFORMS     ///////
// /////////////////////////////////////////
// // $ZodCheckTrim;
// export function trim(params?: string | util.CheckParams): core.$ZodCheckTrim {
//   return new core.$ZodCheckTrim({
//     check: "trim",
//     ...util.normalizeCheckParams(params),
//   });
// }

// // $ZodCheckToLowerCase;
// export function toLowerCase(
//   params?: string | util.CheckParams
// ): core.$ZodCheckToLowerCase {
//   return new core.$ZodCheckToLowerCase({
//     check: "to_lowercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// // $ZodCheckToUpperCase;
// export function toUpperCase(
//   params?: string | util.CheckParams
// ): core.$ZodCheckToUpperCase {
//   return new core.$ZodCheckToUpperCase({
//     check: "to_uppercase",
//     ...util.normalizeCheckParams(params),
//   });
// }

// // $ZodCheckNormalize;
// export function normalize(
//   params?: string | util.CheckParams
// ): core.$ZodCheckNormalize {
//   return new core.$ZodCheckNormalize({
//     check: "normalize",
//     ...util.normalizeCheckParams(params),
//   });
// }
