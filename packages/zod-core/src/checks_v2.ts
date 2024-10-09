import type * as core from "./core.js";
import type * as err from "./errors_v2.js";
import { getParsedType } from "./parse.js";
import type * as types from "./types.js";

export function $ZodCheck(inst: core.$ZodCheck): void {}

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends core.$ZodCheckDef {
  check: "less_than";
  value: types.Numeric;
  inclusive: boolean;
  error?: err.$ZodErrorMap<err.$ZodNumericTooSmallIssues> | undefined;
}
export interface $ZodCheckLessThan<T extends types.Numeric = types.Numeric>
  extends core.$ZodCheck<T, $ZodCheckLessThanDef> {}

const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date",
} as const;

export function $ZodCheckLessThan(inst: $ZodCheckLessThan): void {
  $ZodCheck(inst);

  const origin = numericOriginMap[typeof inst.value as "number" | "bigint" | "object"];
  inst.run = (ctx) => {
    if (inst.inclusive ? ctx.input <= inst.value : ctx.input < inst.value) {
      return;
    }

    // casting to avoid type errors
    ctx.addIssue({
      origin: origin as "number",
      code: "too_big",
      maximum: inst.value as number,
      input: ctx.input as number,
      inclusive: false,
    });
  };
}

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends core.$ZodCheckDef {
  check: "greater_than";
  value: types.Numeric;
  inclusive: boolean;
  error?: err.$ZodErrorMap<err.$ZodNumericTooBigIssues> | undefined;
}
export interface $ZodCheckGreaterThan<T extends types.Numeric = types.Numeric>
  extends core.$ZodCheck<T, $ZodCheckGreaterThanDef> {}

export function $ZodCheckGreaterThan(inst: $ZodCheckGreaterThan): void {
  $ZodCheck(inst);

  const origin = numericOriginMap[typeof inst.value as "number" | "bigint" | "object"];
  inst.run = (ctx) => {
    if (inst.inclusive ? ctx.input <= inst.value : ctx.input < inst.value) {
      return;
    }

    // @ts-ignore
    ctx.addIssue({
      origin: origin, // as "number",
      code: "too_big",
      maximum: inst.value, // as number,
      input: ctx.input, // as number,
      inclusive: false,
    });
  };
}

/////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

interface $ZodCheckMultipleOfDef<T extends number | bigint> extends core.$ZodCheckDef {
  check: "multiple_of";
  value: T;
  error?: err.$ZodErrorMap<err.$ZodIssueNumberNotMultipleOf> | undefined;
}

export interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint>
  extends core.$ZodCheck<T, $ZodCheckMultipleOfDef<T>> {}
export function $ZodCheckMultipleOf(inst: $ZodCheckMultipleOf): void {
  $ZodCheck(inst);

  // inst.check = "multiple_of" as const;

  inst.run = (ctx) => {
    if (typeof ctx.input !== typeof inst.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
    // the casts are safe because we know the types are the same
    const isMultiple =
      typeof ctx.input === "bigint"
        ? ctx.input % (inst.value as bigint) === BigInt(0)
        : floatSafeRemainder(ctx.input, inst.value as number);

    if (!isMultiple) {
      ctx.addIssue(
        {
          origin: typeof ctx.input as "number",
          code: "not_multiple_of",
          divisor: inst.value as number,
          input: ctx.input as number,
        },
        inst
      );
    }
  };
}

//////////////////////////////////
/////    $ZodCheckMaxSize    /////
//////////////////////////////////
export type $ZodSizable = string | Array<unknown> | Set<unknown> | File;

function getSize(input: any): {
  type: "string" | "array" | "set" | "file";
  size: number;
} {
  if (typeof input === "string") return { type: "string", size: input.length };
  if (Array.isArray(input)) return { type: "array", size: input.length };
  if (input instanceof Set) return { type: "set", size: input.size };
  if (input instanceof File) return { type: "file", size: input.size };
  throw new Error(`Invalid input for size check: ${getParsedType(input)}`);
}

interface $ZodCheckMaxSizeDef extends core.$ZodCheckDef {
  check: "max_size";
  maximum: number;
  error?: err.$ZodErrorMap<err.$ZodSizeTooBigIssues> | undefined;
}
export interface $ZodCheckMaxSize<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T, $ZodCheckMaxSizeDef> {}

export function $ZodCheckMaxSize(inst: $ZodCheckMaxSize): void {
  // inst.check = "max_size" as const;
  inst.run = (ctx) => {
    const size = getSize(ctx.input);
    if (size.size > inst.maximum) {
      ctx.addIssue(
        {
          origin: size.type as "array",
          code: "too_big",
          max_size: inst.maximum,
          input: ctx.input as unknown[],
        },
        inst
      );
    }
  };
}

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends core.$ZodCheckDef {
  check: "min_size";
  minSize: number;
  error?: err.$ZodErrorMap<err.$ZodSizeTooSmallIssues> | undefined;
}
export interface $ZodCheckMinSize<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T, $ZodCheckMinSizeDef> {}

export function $ZodCheckMinSize(inst: $ZodCheckMinSize): void {
  $ZodCheck(inst);

  // inst.check = "size_greater_than" as const;

  inst.run = (ctx) => {
    const size = getSize(ctx.input);
    if (size.size < inst.minSize) {
      ctx.addIssue(
        {
          origin: size.type as "array",
          code: "too_small",
          min_size: inst.minSize,
          input: ctx.input as unknown[],
        },
        inst
      );
    }
  };
}

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends core.$ZodCheckDef {
  size: number;
  error?: err.$ZodErrorMap<err.$ZodSizeTooBigIssues | err.$ZodSizeTooSmallIssues> | undefined;
}
export interface $ZodCheckSizeEquals<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T, $ZodCheckSizeEqualsDef> {}

export function $ZodCheckSizeEquals(inst: $ZodCheckSizeEquals): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    const size = getSize(ctx.input);
    if (size.size !== inst.size) {
      const tooBig = size.size > inst.size;
      ctx.addIssue(
        {
          origin: size.type as "array",
          ...(tooBig ? { code: "too_big", max_size: inst.size } : { code: "too_small", min_size: inst.size }),
          input: ctx.input as unknown[],
        },
        inst
      );
    }
  };
}

/////////////////////////////////////////////
/////    _$ZodCheckStringFormatRegex    /////
/////////////////////////////////////////////
/** @abstract */
export interface _$ZodCheckStringFormatDef extends core.$ZodCheckDef {
  check: err.$ZodStringFormats | (string & {});
  error?: err.$ZodErrorMap<err.$ZodIssueStringInvalidFormat> | undefined;
  pattern?: RegExp;
}

export interface _$ZodCheckStringFormat<Def extends _$ZodCheckStringFormatDef = _$ZodCheckStringFormatDef>
  extends core.$ZodCheck<string, Def> {}

export function _$ZodCheckStringFormat(inst: _$ZodCheckStringFormat): void {
  // this will be overridden by formats that don't have a pattern
  inst.run = (ctx) => {
    if (!inst.pattern) throw new Error("Not implemented.");
    if (!inst.pattern.test(ctx.input))
      return ctx.addIssue({
        origin: "string",
        code: "invalid_format",
        format: inst.check as any,
        input: ctx.input,
        ...(inst.pattern ? { pattern: inst.pattern } : {}),
      });
  };
}

////////////////////////////////
/////    $ZodCheckRegex    /////
////////////////////////////////
interface $ZodCheckRegexDef extends _$ZodCheckStringFormatDef {
  check: "regex";
  pattern: RegExp;
}

export interface $ZodCheckRegex extends _$ZodCheckStringFormat<$ZodCheckRegexDef> {}
export function $ZodCheckRegex(inst: $ZodCheckRegex): void {
  // inst.pattern is set on the def so no assignment is necessary
  _$ZodCheckStringFormat(inst);
}

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends core.$ZodCheckDef {
  check: "includes";
  includes: string;
  error?: err.$ZodErrorMap<err.$ZodIssueStringIncludes> | undefined;
}

export interface $ZodCheckIncludes<T extends string = string> extends core.$ZodCheck<T, $ZodCheckIncludesDef> {}

export function $ZodCheckIncludes(inst: $ZodCheckIncludes): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    if (!ctx.input.includes(inst.includes)) {
      ctx.addIssue({
        origin: "string",
        code: "invalid_format",
        format: inst.check,
        includes: inst.includes,
        input: ctx.input,
      });
    }
  };
}

///////////////////////////////
/////    $ZodCheckTrim    /////
///////////////////////////////

export interface $ZodCheckTrimDef extends core.$ZodCheckDef {
  check: "trim";
  error?: err.$ZodErrorMap<never> | undefined;
}
export interface $ZodCheckTrim extends core.$ZodCheck<string, $ZodCheckTrimDef> {}
export function $ZodCheckTrim(inst: $ZodCheckTrim): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    ctx.input = ctx.input.trim();
  };
}

//////////////////////////////////////
/////    $ZodCheckToLowerCase    /////
//////////////////////////////////////
interface $ZodCheckToLowerCaseDef extends core.$ZodCheckDef {
  check: "to_lowercase";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckToLowerCase extends core.$ZodCheck<string, $ZodCheckToLowerCaseDef> {}

export function $ZodCheckToLowerCase(inst: $ZodCheckToLowerCase): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    ctx.input = ctx.input.toLowerCase();
  };
}

//////////////////////////////////////
/////    $ZodCheckToUpperCase    /////
//////////////////////////////////////
interface $ZodCheckToUpperCaseDef extends core.$ZodCheckDef {
  check: "to_uppercase";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckToUpperCase extends core.$ZodCheck<string, $ZodCheckToUpperCaseDef> {}

export function $ZodCheckToUpperCase(inst: $ZodCheckToUpperCase): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    ctx.input = ctx.input.toUpperCase();
  };
}

//////////////////////////////////////
/////    $ZodCheckNormalize    /////
//////////////////////////////////////
interface $ZodCheckNormalizeDef extends core.$ZodCheckDef {
  check: "normalize";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckNormalize extends core.$ZodCheck<string, $ZodCheckNormalizeDef> {}

export function $ZodCheckNormalize(inst: $ZodCheckNormalize): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    ctx.input = ctx.input.normalize();
  };
}
/////////////////////////////////////
/////    $ZodCheckStartsWith    /////
/////////////////////////////////////
interface $ZodCheckStartsWithDef extends core.$ZodCheckDef {
  check: "starts_with";
  startsWith: string;
  error?: err.$ZodErrorMap<err.$ZodIssueStringInvalidFormat> | undefined;
}
export interface $ZodCheckStartsWith<T extends string = string> extends core.$ZodCheck<T, $ZodCheckStartsWithDef> {}

export function $ZodCheckStartsWith(inst: $ZodCheckStartsWith): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    if (!ctx.input.startsWith(inst.startsWith)) {
      ctx.addIssue({
        origin: "string",
        code: "invalid_format",
        format: "starts_with",
        starts_with: inst.startsWith,
        input: ctx.input,
      });
    }
  };
}

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends core.$ZodCheckDef {
  check: "ends_with";
  endsWith: string;
  error?: err.$ZodErrorMap<err.$ZodIssueStringInvalidFormat> | undefined;
}
export interface $ZodCheckEndsWith<T extends string = string> extends core.$ZodCheck<T, $ZodCheckEndsWithDef> {}

export function $ZodCheckEndsWith(inst: $ZodCheckEndsWith): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    if (!ctx.input.endsWith(inst.endsWith)) {
      ctx.addIssue({
        origin: "string",
        code: "invalid_format",
        format: "ends_with",
        ends_with: inst.endsWith,
        input: ctx.input,
      });
    }
  };
}

///////////////////////////////////
/////    $ZodCheckFileType    /////
///////////////////////////////////
interface $ZodCheckFileTypeDef extends core.$ZodCheckDef {
  check: "file_type";
  fileTypes: types.MimeTypes[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileType<T extends File = File> extends core.$ZodCheck<T, $ZodCheckFileTypeDef> {}

export function $ZodCheckFileType(inst: $ZodCheckFileType): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    if (!inst.fileTypes.includes(ctx.input.type as types.MimeTypes)) {
      ctx.addIssue({
        origin: "file",
        code: "invalid_type",
        allowable: inst.fileTypes,
        received: getParsedType(ctx.input.type),
        input: ctx.input.type,
        path: ["type"],
      });
    }
  };
}

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
interface $ZodCheckFileNameDef extends core.$ZodCheckDef {
  check: "file_name";
  fileName: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileName<T extends File = File> extends core.$ZodCheck<T, $ZodCheckFileNameDef> {}

export function $ZodCheckFileName(inst: $ZodCheckFileName): void {
  $ZodCheck(inst);
  inst.run = (ctx) => {
    if (inst.fileName !== ctx.input.name) {
      ctx.addIssue({
        origin: "file",
        code: "invalid_type",
        allowable: [inst.fileName],
        received: getParsedType(ctx.input.type),
        input: ctx.input,
        path: ["name"],
      });
    }
  };
}
