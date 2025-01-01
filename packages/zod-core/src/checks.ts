import * as base from "./base.js";
import type * as errors from "./errors.js";
import * as regexes from "./regexes.js";
import * as util from "./util.js";

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends base.$ZodCheckDef {
  check: "less_than";
  value: util.Numeric;
  inclusive: boolean;
  // error?:
  //   | errors.$ZodErrorMap<
  //       errors.$ZodIssueTooSmall<"number" | "bigint" | "date", util.Numeric>
  //     >
  //   | undefined;
}

export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckLessThanDef;
  "~issc": errors.$ZodIssueTooSmall<"number" | "bigint" | "date", T>;
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

    inst["~onattach"] = (inst) => {
      const curr = inst["~computed"].maximum ?? Number.POSITIVE_INFINITY;
      if (def.value < curr) inst["~computed"].maximum = def.value;
    };
    inst["~run"] = (ctx) => {
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
}
export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckGreaterThanDef;
  "~issc": errors.$ZodIssueTooBig<"number" | "bigint" | "date", T>;
}

export const $ZodCheckGreaterThan: base.$constructor<$ZodCheckGreaterThan> =
  base.$constructor("$ZodCheckGreaterThan", (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin =
      numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst["~onattach"] = (inst) => {
      const curr = inst["~computed"].minimum ?? Number.NEGATIVE_INFINITY;
      if (def.value > curr) inst["~computed"].minimum = def.value;
    };
    inst["~run"] = (ctx) => {
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
  // error?: errors.$ZodErrorMap<errors.$ZodIssueNotMultipleOf> | undefined;
}

export interface $ZodCheckMultipleOf<
  T extends number | bigint = number | bigint,
> extends base.$ZodCheck<T> {
  "~def": $ZodCheckMultipleOfDef<T>;
  "~issc": errors.$ZodIssueNotMultipleOf;
}

export const $ZodCheckMultipleOf: base.$constructor<
  $ZodCheckMultipleOf<number | bigint>
> = base.$constructor("$ZodCheckMultipleOf", (inst, def) => {
  base.$ZodCheck.init(inst, def);

  inst["~onattach"] = (inst) => {
    inst["~computed"].multipleOf ??= def.value;
  };

  inst["~run"] = (ctx) => {
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

/////////////////////////////////////
/////    $ZodCheckFinite    /////
/////////////////////////////////////
interface $ZodCheckFiniteDef extends base.$ZodCheckDef {
  check: "finite";
}

export interface $ZodCheckFinite extends base.$ZodCheck<number> {
  "~def": $ZodCheckFiniteDef;
  "~issc":
    | errors.$ZodIssueTooBig<"number", number>
    | errors.$ZodIssueTooSmall<"number", number>;
}

export const $ZodCheckFinite: base.$constructor<$ZodCheckFinite> =
  base.$constructor("$ZodCheckFinite", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    // inst["~onattach"] = (inst) => {
    //   inst["~computed"].minSize ??= Number.NEGATIVE_INFINITY;
    //   inst["~computed"].maxSize ??= Number.POSITIVE_INFINITY;
    // };
    inst["~run"] = (ctx) => {
      if (Number.isFinite(ctx.value)) return;
      ctx.issues.push({
        origin: "number",
        ...(ctx.value === Number.POSITIVE_INFINITY
          ? {
              code: "too_big",
              maximum: Number.POSITIVE_INFINITY,
            }
          : {
              code: "too_small",
              minimum: Number.NEGATIVE_INFINITY,
            }),
        // code: ctx.value === Number.POSITIVE_INFINITY ? "too_big" : "too_big",
        // maximum: Number.POSITIVE_INFINITY,
        inclusive: false,
        input: ctx.value,
        def,
      });
    };
  });

/////////////////////////////////////
/////    $ZodCheckNumberFormat    /////
/////////////////////////////////////

export type $ZodNumberFormats =
  | "int32"
  | "uint32"
  | "float32"
  | "float64"
  | "safeint";

export interface $ZodCheckNumberFormatDef extends base.$ZodCheckDef {
  check: "number_format";
  format: $ZodNumberFormats;
}

export interface $ZodCheckNumberFormat extends base.$ZodCheck<number> {
  "~def": $ZodCheckNumberFormatDef;
  "~issc":
    | errors.$ZodIssueInvalidType<"int", number>
    | errors.$ZodIssueTooBig<"number">
    | errors.$ZodIssueTooSmall<"number">;
}

export const $ZodCheckNumberFormat: base.$constructor<$ZodCheckNumberFormat> =
  /*@__PURE__*/ base.$constructor("$ZodNumber", (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";

    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = util.NUMBER_FORMAT_RANGES[def.format!];

    inst["~onattach"] = (inst) => {
      inst["~computed"].format = def.format;
      inst["~computed"].minimum = minimum;
      inst["~computed"].maximum = maximum;
    };

    inst["~run"] = (ctx) => {
      const input = ctx.value;

      if (isInt && !Number.isInteger(input)) {
        // invalid_type issue
        ctx.issues.push({
          origin,
          format: def.format,
          code: "invalid_type",
          input,
          def,
        });

        // not_ multiple_of issue
        // ctx.issues.push({
        //   code: "not_multiple_of",
        //   origin: "number",
        //   input,
        //   def,
        //   divisor: 1,
        // });
        ctx.aborted = true;
        return;
      }

      if (input < minimum) {
        ctx.issues.push({
          origin: "number",
          input: input as number,
          code: "too_small",
          minimum: minimum as number,
          inclusive: true,
          def,
        });
      }

      if (input > maximum) {
        ctx.issues.push({
          origin: "number",
          input,
          code: "too_big",
          maximum,
          def,
        } as any);
      }
    };
  });

/////////////////////////////////////
/////    $ZodCheckBigIntFormat    /////
/////////////////////////////////////

export type $ZodBigIntFormats = "int64" | "uint64";

export interface $ZodCheckBigIntFormatDef extends base.$ZodCheckDef {
  check: "bigint_format";
  format: $ZodBigIntFormats | undefined;
  // error?:
  //   | errors.$ZodErrorMap<
  //       | errors.$ZodIssueInvalidType<"bigint", bigint>
  //       | errors.$ZodIssueTooBig<"bigint">
  //       | errors.$ZodIssueTooSmall<"bigint">
  //     >
  //   | undefined;
}

export interface $ZodCheckBigIntFormat extends base.$ZodCheck<bigint> {
  "~def": $ZodCheckBigIntFormatDef;
  "~issc":
    | errors.$ZodIssueTooBig<"bigint">
    | errors.$ZodIssueTooSmall<"bigint">;
}

export const $ZodCheckBigIntFormat: base.$constructor<$ZodCheckBigIntFormat> =
  /*@__PURE__*/ base.$constructor("$ZodCheckBigIntFormat", (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks

    const [minimum, maximum] = util.BIGINT_FORMAT_RANGES[def.format!];

    inst["~onattach"] = (inst) => {
      inst["~computed"].format = def.format;
      inst["~computed"].minimum = minimum;
      inst["~computed"].maximum = maximum;
    };

    inst["~run"] = (ctx) => {
      const input = ctx.value;

      if (input < minimum) {
        ctx.issues.push({
          origin: "bigint",
          input,
          code: "too_small",
          minimum: minimum as any,
          inclusive: true,
          def,
        });
      }

      if (input > maximum) {
        ctx.issues.push({
          origin: "bigint",
          input,
          code: "too_big",
          maximum,
          def,
        } as any);
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

interface $ZodCheckMaxSizeDef extends base.$ZodCheckDef {
  check: "max_size";
  maximum: number;
}
export interface $ZodCheckMaxSize<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckMaxSizeDef;
  "~issc": errors.$ZodIssueTooBig<"string" | "array" | "set" | "file", T>;
}

export const $ZodCheckMaxSize: base.$constructor<$ZodCheckMaxSize> =
  base.$constructor("$ZodCheckMaxSize", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~onattach"] = (inst) => {
      const curr = (inst["~computed"].maximum ??
        Number.POSITIVE_INFINITY) as number;
      if (def.maximum < curr) inst["~computed"].maximum = def.maximum;
    };

    inst["~run"] = (ctx) => {
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
}
export interface $ZodCheckMinSize<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckMinSizeDef;
  "~issc": errors.$ZodIssueTooSmall<"string" | "array" | "set" | "file", T>;
}

export const $ZodCheckMinSize: base.$constructor<$ZodCheckMinSize> =
  base.$constructor("$ZodCheckMinSize", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~onattach"] = (inst) => {
      const curr = (inst["~computed"].minimum ??
        Number.POSITIVE_INFINITY) as number;
      if (def.minimum < curr) inst["~computed"].minimum = def.minimum;
    };

    inst["~run"] = (ctx) => {
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
}
export interface $ZodCheckSizeEquals<T extends util.Sizeable = util.Sizeable>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckSizeEqualsDef;
  "~issc":
    | errors.$ZodIssueTooBig<"string" | "array" | "set" | "file", T>
    | errors.$ZodIssueTooSmall<"string" | "array" | "set" | "file", T>;
}

export const $ZodCheckSizeEquals: base.$constructor<$ZodCheckSizeEquals> =
  base.$constructor("$ZodCheckSizeEquals", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~onattach"] = (inst) => {
      inst["~computed"].minimum = def.size;
      inst["~computed"].maximum = def.size;
      inst["~computed"].size = def.size;
    };

    inst["~run"] = (ctx) => {
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
export interface $ZodCheckStringFormatDef<
  Format extends errors.$ZodStringFormats = errors.$ZodStringFormats,
> extends base.$ZodCheckDef {
  check: "string_format";
  format: Format;
  pattern?: RegExp | undefined;
}

export interface $ZodCheckStringFormat extends base.$ZodCheck<string> {
  "~def": $ZodCheckStringFormatDef;
  "~issc": errors.$ZodIssueInvalidStringFormat;
}

export const $ZodCheckStringFormat: base.$constructor<$ZodCheckStringFormat> =
  base.$constructor("$ZodCheckStringFormat", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~onattach"] = (inst) => {
      inst["~computed"].format = def.format;
      if (def.pattern) inst["~computed"].pattern = def.pattern;
    };

    inst["~run"] = (ctx) => {
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
  "~def": $ZodCheckRegexDef;
}

export const $ZodCheckRegex: base.$constructor<$ZodCheckRegex> =
  base.$constructor("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
  });

///////////////////////////////////
/////    $ZodCheckJSONString    /////
///////////////////////////////////
interface $ZodCheckJSONStringDef
  extends $ZodCheckStringFormatDef<"json_string"> {
  // check: "string_format";
  // format: "json_string";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckJSONString extends $ZodCheckStringFormat {
  "~def": $ZodCheckJSONStringDef;
}

export const $ZodCheckJSONString: base.$constructor<$ZodCheckJSONString> =
  base.$constructor("$ZodCheckJSONString", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
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
interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef<"lowercase"> {
  // check: "string_format";
  // format: "lowercase";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckLowerCase extends $ZodCheckStringFormat {
  "~def": $ZodCheckLowerCaseDef;
}

export const $ZodCheckLowerCase: base.$constructor<$ZodCheckLowerCase> =
  base.$constructor("$ZodCheckLowerCase", (inst, def) => {
    def.pattern ??= regexes.lowercaseRegex;
    $ZodCheckStringFormat.init(inst, def);
  });

//////////////////////////////////////
/////    $ZodCheckUpperCase    /////
//////////////////////////////////////
interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef<"uppercase"> {
  // check: "string_format";
  // format: "uppercase";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckUpperCase extends $ZodCheckStringFormat {
  "~def": $ZodCheckUpperCaseDef;
}

export const $ZodCheckUpperCase: base.$constructor<$ZodCheckUpperCase> =
  base.$constructor("$ZodCheckUpperCase", (inst, def) => {
    def.pattern ??= regexes.uppercaseRegex;
    $ZodCheckStringFormat.init(inst, def);
  });

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends $ZodCheckStringFormatDef<"includes"> {
  // check: "includes";
  includes: string;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckIncludes<T extends string = string>
  extends $ZodCheckStringFormat {
  "~def": $ZodCheckIncludesDef;
}

export const $ZodCheckIncludes: base.$constructor<$ZodCheckIncludes> =
  base.$constructor("$ZodCheckIncludes", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
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
interface $ZodCheckStartsWithDef
  extends $ZodCheckStringFormatDef<"starts_with"> {
  // check: "starts_with";
  prefix: string;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckStartsWith<T extends string = string>
  extends $ZodCheckStringFormat {
  "~def": $ZodCheckStartsWithDef;
}

export const $ZodCheckStartsWith: base.$constructor<$ZodCheckStartsWith> =
  base.$constructor("$ZodCheckStartsWith", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
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
interface $ZodCheckEndsWithDef extends $ZodCheckStringFormatDef<"ends_with"> {
  // check: "ends_with";
  suffix: string;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckEndsWith<T extends string = string>
  extends $ZodCheckStringFormat {
  "~def": $ZodCheckEndsWithDef;
}

export const $ZodCheckEndsWith: base.$constructor<$ZodCheckEndsWith> =
  base.$constructor("$ZodCheckEndsWith", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
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
//   error?: errors.$ZodErrorMap<never> | undefined;
// }

// export interface $ZodCheckProperty<T extends File = File>
//   extends base.$ZodCheck<T> {
//   "~def": $ZodCheckPropertyDef;
// }

///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
interface $ZodCheckPropertyDef extends base.$ZodCheckDef {
  check: "property";
  property: string;
  schema: base.$ZodType;
  // error?: errors.$ZodErrorMap<never> | undefined;
}

export interface $ZodCheckProperty<T extends object = object>
  extends base.$ZodCheck<T> {
  "~def": $ZodCheckPropertyDef;
  "~issc": errors.$ZodIssue;
}

export const $ZodCheckProperty: base.$constructor<$ZodCheckProperty> =
  base.$constructor("$ZodCheckProperty", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
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
      const result = def.schema["~parse"]((ctx.value as any)[def.property]);
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
// interface $ZodCheckFileTypeDef extends base.$ZodCheckDef {
//   check: "file_type";
//   fileTypes: util.MimeTypes[];
//   // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
// }
// export interface $ZodCheckFileType<T extends File = File>
//   extends base.$ZodCheck<T> {
//   "~def": $ZodCheckFileTypeDef;
// }

// export const $ZodCheckFileType: base.$constructor<$ZodCheckFileType> =
//   base.$constructor("$ZodCheckFileType", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst['~run'] = (ctx) => {
//       if (def.fileTypes.includes(ctx.value.type as util.MimeTypes)) return;
//       ctx.issues.push({
//         origin: "file",
//         code: "invalid_value",
//         options: def.fileTypes,
//         input: ctx.value.type,
//         path: ["type"],
//         def,
//       });
//     };
//   });

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
// interface $ZodCheckFileNameDef extends base.$ZodCheckDef {
//   check: "file_name";
//   fileName: string;
//   error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidType> | undefined;
// }
// export interface $ZodCheckFileName<T extends File = File>
//   extends base.$ZodCheck<T> {
//   "~def": $ZodCheckFileNameDef;
// }

// export const $ZodCheckFileName: base.$constructor<$ZodCheckFileName> =
//   base.$constructor("$ZodCheckFileName", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst['~run'] = (ctx) => {
//       if (def.fileName === ctx.value.name) return;
//       ctx.issues.push({
//         origin: "file",
//         code: "invalid_value",
//         options: [def.fileName],
//         input: ctx.value,
//         path: ["name"],
//         def,
//       });
//     };
//   });

///////////////////////////////////
/////    $ZodCheckOverwrite    /////
///////////////////////////////////
export interface $ZodCheckOverwriteDef<T> extends base.$ZodCheckDef {
  check: "overwrite";
  tx(value: T): T;
  // error?: never;
}

export interface $ZodCheckOverwrite<T = unknown> extends base.$ZodCheck<T> {
  "~def": $ZodCheckOverwriteDef<T>;
  "~issc": never;
}

export const $ZodCheckOverwrite: base.$constructor<$ZodCheckOverwrite> =
  base.$constructor("$ZodCheckOverwrite", (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst["~run"] = (ctx) => {
      ctx.value = def.tx(ctx.value);
    };
  });

// ///////////////////////////////
// /////    $ZodCheckTrim    /////
// ///////////////////////////////
// export interface $ZodCheckTrimDef extends base.$ZodCheckDef {
//   check: "trim";
//   error?: errors.$ZodErrorMap<never> | undefined;
// }
// export interface $ZodCheckTrim extends base.$ZodCheck<string> {
//   "~def": $ZodCheckTrimDef;
// }

// export const $ZodCheckTrim: base.$constructor<$ZodCheckTrim> =
//   base.$constructor("$ZodCheckTrim", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst['~run'] = (ctx) => {
//       ctx.value = ctx.value.trim();
//     };
//   });

// //////////////////////////////////////
// /////    $ZodCheckNormalize    /////
// //////////////////////////////////////
// interface $ZodCheckNormalizeDef extends base.$ZodCheckDef {
//   check: "normalize";
//   error?: errors.$ZodErrorMap<never> | undefined;
// }

// export interface $ZodCheckNormalize extends base.$ZodCheck<string> {
//   "~def": $ZodCheckNormalizeDef;
// }

// export const $ZodCheckNormalize: base.$constructor<$ZodCheckNormalize> =
//   base.$constructor("$ZodCheckNormalize", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst['~run'] = (ctx) => {
//       ctx.value = ctx.value.normalize();
//     };
//   });
