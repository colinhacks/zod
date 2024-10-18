import * as core from "./core.js";
import type * as err from "./errors.js";
import type * as types from "./types.js";

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends core.$ZodCheckDef {
  check: "less_than";
  value: types.Numeric;
  inclusive: boolean;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooSmall<"number" | "bigint" | "date", types.Numeric>
      >
    | undefined;
}
export interface $ZodCheckLessThan<T extends types.Numeric = types.Numeric>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckLessThanDef;
}

const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date",
} as const;

export const $ZodCheckLessThan: core.$constructor<$ZodCheckLessThan> =
  core.$constructor("$ZodCheckLessThan", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    const origin =
      numericOriginMap[
        typeof inst._def.value as "number" | "bigint" | "object"
      ];
    inst.run = (ctx) => {
      if (
        inst._def.inclusive
          ? ctx.input <= inst._def.value
          : ctx.input < inst._def.value
      ) {
        return;
      }

      // casting to avoid type errors
      ctx.addIssue({
        origin: origin as "number",
        code: "too_big",
        maximum: inst._def.value as number,
        input: ctx.input as number,
        inclusive: inst._def.inclusive,
      });
    };
  });

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends core.$ZodCheckDef {
  check: "greater_than";
  value: types.Numeric;
  inclusive: boolean;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooBig<"number" | "bigint" | "date", types.Numeric>
      >
    | undefined;
}
export interface $ZodCheckGreaterThan<T extends types.Numeric = types.Numeric>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckGreaterThanDef;
}

export const $ZodCheckGreaterThan: core.$constructor<$ZodCheckGreaterThan> =
  core.$constructor("$ZodCheckGreaterThan", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    const origin =
      numericOriginMap[
        typeof inst._def.value as "number" | "bigint" | "object"
      ];
    inst.run = (ctx) => {
      if (
        inst._def.inclusive
          ? ctx.input >= inst._def.value
          : ctx.input > inst._def.value
      ) {
        return;
      }

      ctx.addIssue({
        origin: origin as "number",
        code: "too_small",
        minimum: inst._def.value as number,
        input: ctx.input as number,
        inclusive: inst._def.inclusive,
      });
    };
  });

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

interface $ZodCheckMultipleOfDef<T extends number | bigint>
  extends core.$ZodCheckDef {
  check: "multiple_of";
  value: T;
  error?: err.$ZodErrorMap<err.$ZodIssueNotMultipleOf> | undefined;
}

export interface $ZodCheckMultipleOf<
  T extends number | bigint = number | bigint,
> extends core.$ZodCheck<T> {
  _def: $ZodCheckMultipleOfDef<T>;
}

export const $ZodCheckMultipleOf: core.$constructor<
  $ZodCheckMultipleOf<number | bigint>
> = core.$constructor("$ZodCheckMultipleOf", (inst, def) => {
  core.$ZodCheck.init(inst, def);
  inst.run = (ctx) => {
    if (typeof ctx.input !== typeof inst._def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    // the casts are safe because we know the types are the same
    const isMultiple =
      typeof ctx.input === "bigint"
        ? ctx.input % (inst._def.value as bigint) === BigInt(0)
        : floatSafeRemainder(ctx.input, inst._def.value as number);

    if (!isMultiple) {
      ctx.addIssue({
        origin: typeof ctx.input as "number",
        code: "not_multiple_of",
        divisor: inst._def.value as number,
        input: ctx.input as number,
      });
    }
  };
});
//////////////////////////////////
/////    $ZodCheckMaxSize    /////
//////////////////////////////////
function getSize(input: any): {
  type: "string" | "array" | "set" | "file";
  size: number;
} {
  if (typeof input === "string") return { type: "string", size: input.length };
  if (Array.isArray(input)) return { type: "array", size: input.length };
  if (input instanceof Set) return { type: "set", size: input.size };
  if (input instanceof File) return { type: "file", size: input.size };
  throw new Error(
    `Invalid input for size check: ${input?.constructor?.name ?? typeof input}. This is a problem with Zod, please file an issue.`
  );
}

interface $ZodCheckMaxSizeDef extends core.$ZodCheckDef {
  check: "max_size";
  maximum: number;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooBig<"string" | "array" | "set" | "file", types.Sizeable>
      >
    | undefined;
}
export interface $ZodCheckMaxSize<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckMaxSizeDef;
}

export const $ZodCheckMaxSize: core.$constructor<$ZodCheckMaxSize> =
  core.$constructor("$ZodCheckMaxSize", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      const size = getSize(ctx.input);
      if (size.size > inst._def.maximum) {
        ctx.addIssue({
          origin: size.type as "array",
          code: "too_big",
          maximum: inst._def.maximum,
          input: ctx.input as unknown[],
        });
      }
    };
  });

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends core.$ZodCheckDef {
  check: "min_size";
  minimum: number;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooSmall<
          "string" | "array" | "set" | "file",
          types.Sizeable
        >
      >
    | undefined;
}
export interface $ZodCheckMinSize<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckMinSizeDef;
}

export const $ZodCheckMinSize: core.$constructor<$ZodCheckMinSize> =
  core.$constructor("$ZodCheckMinSize", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      const size = getSize(ctx.input);
      if (size.size < inst._def.minimum) {
        ctx.addIssue({
          origin: size.type as "array",
          code: "too_small",
          minimum: inst._def.minimum,
          input: ctx.input as unknown[],
        });
      }
    };
  });

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends core.$ZodCheckDef {
  size: number;
  error?:
    | err.$ZodErrorMap<
        | err.$ZodIssueTooBig<
            "string" | "array" | "set" | "file",
            types.Sizeable
          >
        | err.$ZodIssueTooSmall<
            "string" | "array" | "set" | "file",
            types.Sizeable
          >
      >
    | undefined;
}
export interface $ZodCheckSizeEquals<T extends types.Sizeable = types.Sizeable>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckSizeEqualsDef;
}

export const $ZodCheckSizeEquals: core.$constructor<$ZodCheckSizeEquals> =
  core.$constructor("$ZodCheckSizeEquals", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      const size = getSize(ctx.input);
      if (size.size !== inst._def.size) {
        const tooBig = size.size > inst._def.size;
        ctx.addIssue({
          origin: size.type as "array",
          ...(tooBig
            ? { code: "too_big", maximum: inst._def.size }
            : { code: "too_small", minimum: inst._def.size }),
          input: ctx.input as unknown[],
        });
      }
    };
  });

/////////////////////////////////////////////
/////    _$ZodCheckStringFormatRegex    /////
/////////////////////////////////////////////
/** @abstract */
export interface _$ZodCheckStringFormatDef extends core.$ZodCheckDef {
  check: "string_format";
  format: err.$ZodStringFormats | (string & {});
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
  pattern?: RegExp;
}

export interface _$ZodCheckStringFormat extends core.$ZodCheck<string> {
  _def: _$ZodCheckStringFormatDef;
}

export const _$ZodCheckStringFormat: core.$constructor<_$ZodCheckStringFormat> =
  core.$constructor("_$ZodCheckStringFormat", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (!inst._def.pattern) throw new Error("Not implemented.");
      if (!inst._def.pattern.test(ctx.input)) {
        ctx.addIssue({
          origin: "string",
          code: "invalid_format",
          format: inst._def.format,
          input: ctx.input,
          ...(inst._def.pattern
            ? { pattern: inst._def.pattern.toString() }
            : {}),
        });
      }
    };
  });

////////////////////////////////
/////    $ZodCheckRegex    /////
////////////////////////////////
interface $ZodCheckRegexDef extends _$ZodCheckStringFormatDef {
  format: "regex";
  pattern: RegExp;
}

export interface $ZodCheckRegex extends _$ZodCheckStringFormat {
  _def: $ZodCheckRegexDef;
}

export const $ZodCheckRegex: core.$constructor<$ZodCheckRegex> =
  core.$constructor("$ZodCheckRegex", (inst, def) => {
    _$ZodCheckStringFormat.init(inst, def);
  });

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends core.$ZodCheckDef {
  check: "includes";
  includes: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckIncludes<T extends string = string>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckIncludesDef;
}

export const $ZodCheckIncludes: core.$constructor<$ZodCheckIncludes> =
  core.$constructor("$ZodCheckIncludes", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (!ctx.input.includes(inst._def.includes)) {
        ctx.addIssue({
          origin: "string",
          code: "invalid_format",
          format: inst._def.check,
          includes: inst._def.includes,
          input: ctx.input,
        });
      }
    };
  });

///////////////////////////////
/////    $ZodCheckTrim    /////
///////////////////////////////
export interface $ZodCheckTrimDef extends core.$ZodCheckDef {
  check: "trim";
  error?: err.$ZodErrorMap<never> | undefined;
}
export interface $ZodCheckTrim extends core.$ZodCheck<string> {
  _def: $ZodCheckTrimDef;
}

export const $ZodCheckTrim: core.$constructor<$ZodCheckTrim> =
  core.$constructor("$ZodCheckTrim", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      ctx.input = ctx.input.trim();
    };
  });

//////////////////////////////////////
/////    $ZodCheckToLowerCase    /////
//////////////////////////////////////
interface $ZodCheckToLowerCaseDef extends core.$ZodCheckDef {
  check: "to_lowercase";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckToLowerCase extends core.$ZodCheck<string> {
  _def: $ZodCheckToLowerCaseDef;
}

export const $ZodCheckToLowerCase: core.$constructor<$ZodCheckToLowerCase> =
  core.$constructor("$ZodCheckToLowerCase", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      ctx.input = ctx.input.toLowerCase();
    };
  });

//////////////////////////////////////
/////    $ZodCheckToUpperCase    /////
//////////////////////////////////////
interface $ZodCheckToUpperCaseDef extends core.$ZodCheckDef {
  check: "to_uppercase";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckToUpperCase extends core.$ZodCheck<string> {
  _def: $ZodCheckToUpperCaseDef;
}

export const $ZodCheckToUpperCase: core.$constructor<$ZodCheckToUpperCase> =
  core.$constructor("$ZodCheckToUpperCase", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      ctx.input = ctx.input.toUpperCase();
    };
  });

//////////////////////////////////////
/////    $ZodCheckNormalize    /////
//////////////////////////////////////
interface $ZodCheckNormalizeDef extends core.$ZodCheckDef {
  check: "normalize";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckNormalize extends core.$ZodCheck<string> {
  _def: $ZodCheckNormalizeDef;
}

export const $ZodCheckNormalize: core.$constructor<$ZodCheckNormalize> =
  core.$constructor("$ZodCheckNormalize", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      ctx.input = ctx.input.normalize();
    };
  });

/////////////////////////////////////
/////    $ZodCheckStartsWith    /////
/////////////////////////////////////
interface $ZodCheckStartsWithDef extends core.$ZodCheckDef {
  check: "starts_with";
  prefix: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckStartsWith<T extends string = string>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckStartsWithDef;
}

export const $ZodCheckStartsWith: core.$constructor<$ZodCheckStartsWith> =
  core.$constructor("$ZodCheckStartsWith", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (!ctx.input.startsWith(inst._def.prefix)) {
        ctx.addIssue({
          origin: "string",
          code: "invalid_format",
          format: "starts_with",
          prefix: inst._def.prefix,
          input: ctx.input,
        });
      }
    };
  });

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends core.$ZodCheckDef {
  check: "ends_with";
  suffix: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckEndsWith<T extends string = string>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckEndsWithDef;
}

export const $ZodCheckEndsWith: core.$constructor<$ZodCheckEndsWith> =
  core.$constructor("$ZodCheckEndsWith", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (!ctx.input.endsWith(inst._def.suffix)) {
        ctx.addIssue({
          origin: "string",
          code: "invalid_format",
          format: "ends_with",
          suffix: inst._def.suffix,
          input: ctx.input,
        });
      }
    };
  });

///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
interface $ZodCheckPropertyDef extends core.$ZodCheckDef {
  check: "property";
  property: string;
  schema: core.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckProperty<T extends File = File>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckPropertyDef;
}

function handleCheckPropertyResults(
  results: core.$SyncParseResult,
  ctx: core.$ZodCheckCtx<File>,
  prop: string
) {
  if (core.failed(results)) {
    ctx.fail!.issues.push(
      ...results.issues.map((i) => ({
        ...i,
        path: [prop, ...i.path],
      }))
    );
  }
}
export const $ZodCheckProperty: core.$constructor<$ZodCheckProperty> =
  core.$constructor("$ZodCheckProperty", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      const prop = (ctx.input as any)[inst._def.property];
      const result = inst._def.schema._parse(prop);
      if (result instanceof Promise) {
        return result.then((res) => handleCheckPropertyResults(res, ctx, prop));
      }
      return handleCheckPropertyResults(result, ctx, prop);
    };
  });

///////////////////////////////////
/////    $ZodCheckFileType    /////
///////////////////////////////////
interface $ZodCheckFileTypeDef extends core.$ZodCheckDef {
  check: "file_type";
  fileTypes: types.MimeTypes[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileType<T extends File = File>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckFileTypeDef;
}

export const $ZodCheckFileType: core.$constructor<$ZodCheckFileType> =
  core.$constructor("$ZodCheckFileType", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (!inst._def.fileTypes.includes(ctx.input.type as types.MimeTypes)) {
        ctx.addIssue({
          origin: "file",
          code: "invalid_enum",
          options: inst._def.fileTypes,
          input: ctx.input.type,
          path: ["type"],
        });
      }
    };
  });

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
interface $ZodCheckFileNameDef extends core.$ZodCheckDef {
  check: "file_name";
  fileName: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileName<T extends File = File>
  extends core.$ZodCheck<T> {
  _def: $ZodCheckFileNameDef;
}

export const $ZodCheckFileName: core.$constructor<$ZodCheckFileName> =
  core.$constructor("$ZodCheckFileName", (inst, def) => {
    core.$ZodCheck.init(inst, def);
    inst.run = (ctx) => {
      if (inst._def.fileName !== ctx.input.name) {
        ctx.addIssue({
          origin: "file",
          code: "invalid_enum",
          options: [inst._def.fileName],
          input: ctx.input,
          path: ["name"],
        });
      }
    };
  });
