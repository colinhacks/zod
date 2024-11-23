import * as base from "./base.js";
import type * as err from "./errors.js";
import * as regexes from "./regexes.js";
import type * as util from "./util.js";

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends base.$ZodCheckDef {
  check: "less_than";
  value: util.Numeric;
  inclusive: boolean;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooSmall<"number" | "bigint" | "date", util.Numeric>
      >
    | undefined;
}

export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckLessThanDef;
}

const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date",
} as const;

export const $ZodCheckLessThan: base.$constructor<$ZodCheckLessThan> =
  base.$constructor("$ZodCheckLessThan", (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin =
      numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst.run2 = (ctx) => {
      if (def.inclusive ? ctx.value <= def.value : ctx.value < def.value) {
        return;
      }

      ctx.issues.push({
        origin: origin as "number",
        code: "too_big",
        maximum: def.value as number,
        input: ctx.value,
        inclusive: def.inclusive,
        def,
      });
    };
  });

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends base.$ZodCheckDef {
  check: "greater_than";
  value: util.Numeric;
  inclusive: boolean;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooBig<"number" | "bigint" | "date", util.Numeric>
      >
    | undefined;
}
export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckGreaterThanDef;
}

export const $ZodCheckGreaterThan: base.$constructor<$ZodCheckGreaterThan> =
  base.$constructor("$ZodCheckGreaterThan", (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin =
      numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst.run2 = (ctx) => {
      if (def.inclusive ? ctx.value >= def.value : ctx.value > def.value) {
        return;
      }

      ctx.issues.push({
        origin: origin as "number",
        code: "too_small",
        minimum: def.value as number,
        input: ctx.value,
        inclusive: def.inclusive,
        def,
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
  extends base.$ZodCheckDef {
  check: "multiple_of";
  value: T;
  error?: err.$ZodErrorMap<err.$ZodIssueNotMultipleOf> | undefined;
}

export interface $ZodCheckMultipleOf<
  T extends number | bigint = number | bigint,
> extends base.$ZodCheck<T> {
  _def: $ZodCheckMultipleOfDef<T>;
}

export const $ZodCheckMultipleOf: base.$constructor<
  $ZodCheckMultipleOf<number | bigint>
> = base.$constructor("$ZodCheckMultipleOf", (inst, def) => {
  base.$ZodCheck.init(inst, def);

  inst.run2 = (ctx) => {
    if (typeof ctx.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple =
      typeof ctx.value === "bigint"
        ? ctx.value % (def.value as bigint) === BigInt(0)
        : floatSafeRemainder(ctx.value, def.value as number);

    if (isMultiple) return;
    ctx.issues.push({
      origin: typeof ctx.value as "number",
      code: "not_multiple_of",
      divisor: def.value as number,
      input: ctx.value,
      def,
    });
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

interface $ZodCheckMaxSizeDef extends base.$ZodCheckDef {
  check: "max_size";
  maximum: number;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooBig<"string" | "array" | "set" | "file", util.Sizeable>
      >
    | undefined;
}
export interface $ZodCheckMaxSize<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckMaxSizeDef;
}

export const $ZodCheckMaxSize: base.$constructor<$ZodCheckMaxSize> =
  base.$constructor("$ZodCheckMaxSize", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      const size = getSize(ctx.value);
      if (size.size <= def.maximum) return;
      ctx.issues.push({
        origin: size.type as "array",
        code: "too_big",
        maximum: def.maximum,
        input: ctx.value,
        def,
      });
    };
  });

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends base.$ZodCheckDef {
  check: "min_size";
  minimum: number;
  error?:
    | err.$ZodErrorMap<
        err.$ZodIssueTooSmall<
          "string" | "array" | "set" | "file",
          util.Sizeable
        >
      >
    | undefined;
}
export interface $ZodCheckMinSize<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckMinSizeDef;
}

export const $ZodCheckMinSize: base.$constructor<$ZodCheckMinSize> =
  base.$constructor("$ZodCheckMinSize", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      const size = getSize(ctx.value);
      if (size.size >= def.minimum) return;
      ctx.issues.push({
        origin: size.type as "array",
        code: "too_small",
        minimum: def.minimum,
        input: ctx.value,
        def,
      });
    };
  });

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends base.$ZodCheckDef {
  size: number;
  error?:
    | err.$ZodErrorMap<
        | err.$ZodIssueTooBig<
            "string" | "array" | "set" | "file",
            util.Sizeable
          >
        | err.$ZodIssueTooSmall<
            "string" | "array" | "set" | "file",
            util.Sizeable
          >
      >
    | undefined;
}
export interface $ZodCheckSizeEquals<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckSizeEqualsDef;
}

export const $ZodCheckSizeEquals: base.$constructor<$ZodCheckSizeEquals> =
  base.$constructor("$ZodCheckSizeEquals", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      const size = getSize(ctx.value);
      if (size.size === def.size) return;
      const tooBig = size.size > def.size;
      ctx.issues.push({
        origin: size.type as "array",
        ...(tooBig
          ? { code: "too_big", maximum: def.size }
          : { code: "too_small", minimum: def.size }),
        input: ctx.value,
        def,
      });
    };
  });

/////////////////////////////////////////////
/////    $ZodCheckStringFormatRegex    /////
/////////////////////////////////////////////
/** @abstract */
export interface $ZodCheckStringFormatDef extends base.$ZodCheckDef {
  check: "string_format";
  format: err.$ZodStringFormats | (string & {});
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
  pattern?: RegExp;
}

export interface $ZodCheckStringFormat extends base.$ZodCheck<string> {
  _def: $ZodCheckStringFormatDef;
}

export const $ZodCheckStringFormat: base.$constructor<$ZodCheckStringFormat> =
  base.$constructor("$ZodCheckStringFormat", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      console.log(`ctx.value: ${ctx.value}`);
      if (!def.pattern) throw new Error("Not implemented.");
      if (def.pattern.test(ctx.value)) return;
      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: ctx.value,
        ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
        def,
      });
    };
  });

////////////////////////////////
/////    $ZodCheckRegex    /////
////////////////////////////////
interface $ZodCheckRegexDef extends $ZodCheckStringFormatDef {
  format: "regex";
  pattern: RegExp;
}

export interface $ZodCheckRegex extends $ZodCheckStringFormat {
  _def: $ZodCheckRegexDef;
}

export const $ZodCheckRegex: base.$constructor<$ZodCheckRegex> =
  base.$constructor("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
  });

///////////////////////////////////
/////    $ZodCheckJSONString    /////
///////////////////////////////////
interface $ZodCheckJSONStringDef extends $ZodCheckStringFormatDef {
  check: "string_format";
  format: "json_string";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckJSONString extends $ZodCheckStringFormat {
  _def: $ZodCheckJSONStringDef;
}

export const $ZodCheckJSONString: base.$constructor<$ZodCheckJSONString> =
  base.$constructor("$ZodCheckJSONString", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      try {
        JSON.parse(ctx.value);
        return;
      } catch (_) {
        ctx.issues.push({
          origin: "string",
          code: "invalid_format",
          format: def.format,
          input: ctx.value,
          def,
        });
      }
    };
  });

//////////////////////////////////////
/////    $ZodCheckLowerCase    /////
//////////////////////////////////////
interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef {
  check: "string_format";
  format: "lowercase";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckLowerCase extends $ZodCheckStringFormat {
  _def: $ZodCheckLowerCaseDef;
}

export const $ZodCheckLowerCase: base.$constructor<$ZodCheckLowerCase> =
  base.$constructor("$ZodCheckLowerCase", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    def.pattern = regexes.lowercaseRegex;
  });

//////////////////////////////////////
/////    $ZodCheckUpperCase    /////
//////////////////////////////////////
interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef {
  check: "string_format";
  format: "uppercase";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckUpperCase extends $ZodCheckStringFormat {
  _def: $ZodCheckUpperCaseDef;
}

export const $ZodCheckUpperCase: base.$constructor<$ZodCheckUpperCase> =
  base.$constructor("$ZodCheckUpperCase", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    def.pattern = regexes.uppercaseRegex;
  });

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends base.$ZodCheckDef {
  check: "includes";
  includes: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckIncludes<T extends string = string>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckIncludesDef;
}

export const $ZodCheckIncludes: base.$constructor<$ZodCheckIncludes> =
  base.$constructor("$ZodCheckIncludes", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (ctx.value.includes(def.includes)) return;
      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "includes",
        includes: def.includes,
        input: ctx.value,
        def,
      });
    };
  });

/////////////////////////////////////
/////    $ZodCheckStartsWith    /////
/////////////////////////////////////
interface $ZodCheckStartsWithDef extends base.$ZodCheckDef {
  check: "starts_with";
  prefix: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckStartsWith<T extends string = string>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckStartsWithDef;
}

export const $ZodCheckStartsWith: base.$constructor<$ZodCheckStartsWith> =
  base.$constructor("$ZodCheckStartsWith", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (ctx.value.startsWith(def.prefix)) return;
      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "starts_with",
        prefix: def.prefix,
        input: ctx.value,
        def,
      });
    };
  });

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends base.$ZodCheckDef {
  check: "ends_with";
  suffix: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckEndsWith<T extends string = string>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckEndsWithDef;
}

export const $ZodCheckEndsWith: base.$constructor<$ZodCheckEndsWith> =
  base.$constructor("$ZodCheckEndsWith", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (ctx.value.endsWith(def.suffix)) return;
      ctx.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "ends_with",
        suffix: def.suffix,
        input: ctx.value,
        def,
      });
    };
  });

// ///////////////////////////////////
// /////    $ZodCheckProperty    /////
// ///////////////////////////////////
// interface $ZodCheckPropertyDef extends base.$ZodCheckDef {
//   check: "property";
//   property: string;
//   schema: base.$ZodType;
//   error?: err.$ZodErrorMap<never> | undefined;
// }

// export interface $ZodCheckProperty<T extends File = File>
//   extends base.$ZodCheck<T> {
//   _def: $ZodCheckPropertyDef;
// }

///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
interface $ZodCheckPropertyDef extends base.$ZodCheckDef {
  check: "property";
  property: string;
  schema: base.$ZodType;
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckProperty<T extends object = object>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckPropertyDef;
}

export const $ZodCheckProperty: base.$constructor<$ZodCheckProperty> =
  base.$constructor("$ZodCheckProperty", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (typeof ctx.value !== "object") {
        // invalid_type
        ctx.issues.push({
          origin: "object",
          code: "invalid_type",
          expected: "object",
          input: ctx.value,
          def,
        });
        return;
      }
      const result = def.schema._parse((ctx.value as any)[def.property]);
      if (result instanceof Promise) {
        return result.then((result) => {
          if (base.$failed(result)) {
            ctx.issues.push(...base.$prefixIssues(def.property, result.issues));
          }
        });
      }
      if (base.$failed(result)) {
        ctx.issues.push(...base.$prefixIssues(def.property, result.issues));
      }
      return;
    };
  });

///////////////////////////////////
/////    $ZodCheckFileType    /////
///////////////////////////////////
interface $ZodCheckFileTypeDef extends base.$ZodCheckDef {
  check: "file_type";
  fileTypes: util.MimeTypes[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileType<T extends File = File>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckFileTypeDef;
}

export const $ZodCheckFileType: base.$constructor<$ZodCheckFileType> =
  base.$constructor("$ZodCheckFileType", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (def.fileTypes.includes(ctx.value.type as util.MimeTypes)) return;
      ctx.issues.push({
        origin: "file",
        code: "invalid_value",
        options: def.fileTypes,
        input: ctx.value.type,
        path: ["type"],
        def,
      });
    };
  });

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
interface $ZodCheckFileNameDef extends base.$ZodCheckDef {
  check: "file_name";
  fileName: string;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}
export interface $ZodCheckFileName<T extends File = File>
  extends base.$ZodCheck<T> {
  _def: $ZodCheckFileNameDef;
}

export const $ZodCheckFileName: base.$constructor<$ZodCheckFileName> =
  base.$constructor("$ZodCheckFileName", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      if (def.fileName === ctx.value.name) return;
      ctx.issues.push({
        origin: "file",
        code: "invalid_value",
        options: [def.fileName],
        input: ctx.value,
        path: ["name"],
        def,
      });
    };
  });

///////////////////////////////////
/////    $ZodCheckOverwrite    /////
///////////////////////////////////
export interface $ZodCheckOverwriteDef<T> extends base.$ZodCheckDef {
  check: "overwrite";
  tx(value: T): T;
  error?: never;
}

export interface $ZodCheckOverwrite<T = unknown> extends base.$ZodCheck<T> {
  _def: $ZodCheckOverwriteDef<T>;
}

export const $ZodCheckOverwrite: base.$constructor<$ZodCheckOverwrite> =
  base.$constructor("$ZodCheckOverwrite", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst.run2 = (ctx) => {
      ctx.value = def.tx(ctx.value);
    };
  });

// ///////////////////////////////
// /////    $ZodCheckTrim    /////
// ///////////////////////////////
// export interface $ZodCheckTrimDef extends base.$ZodCheckDef {
//   check: "trim";
//   error?: err.$ZodErrorMap<never> | undefined;
// }
// export interface $ZodCheckTrim extends base.$ZodCheck<string> {
//   _def: $ZodCheckTrimDef;
// }

// export const $ZodCheckTrim: base.$constructor<$ZodCheckTrim> =
//   base.$constructor("$ZodCheckTrim", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst.run2 = (ctx) => {
//       ctx.value = ctx.value.trim();
//     };
//   });

// //////////////////////////////////////
// /////    $ZodCheckNormalize    /////
// //////////////////////////////////////
// interface $ZodCheckNormalizeDef extends base.$ZodCheckDef {
//   check: "normalize";
//   error?: err.$ZodErrorMap<never> | undefined;
// }

// export interface $ZodCheckNormalize extends base.$ZodCheck<string> {
//   _def: $ZodCheckNormalizeDef;
// }

// export const $ZodCheckNormalize: base.$constructor<$ZodCheckNormalize> =
//   base.$constructor("$ZodCheckNormalize", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst.run2 = (ctx) => {
//       ctx.value = ctx.value.normalize();
//     };
//   });
