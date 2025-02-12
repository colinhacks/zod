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
  // abort?: boolean;
  // error?:
  //   | errors.$ZodErrorMap<
  //       errors.$ZodIssueTooSmall<"number" | "bigint" | "date", util.Numeric>
  //     >
  //   | undefined;
}

export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends base.$ZodCheck<T> {
  _def: $ZodCheckLessThanDef;
  _issc: errors.$ZodIssueTooSmall<T>;
}

const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date",
} as const;

export const $ZodCheckLessThan: base.$constructor<$ZodCheckLessThan> = base.$constructor(
  "$ZodCheckLessThan",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst._onattach = (inst) => {
      const curr = inst._computed.maximum ?? Number.POSITIVE_INFINITY;
      if (def.value < curr) inst._computed.maximum = def.value;
    };

    inst._check = (payload) => {
      if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
        return;
      }

      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.value as number,
        input: payload.value,
        inclusive: def.inclusive,
        def,
        continue: !def.abort,
      });
    };

    // inst["_checkB"] = (payload,_payload) => {
    //   if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
    //     return;
    //   }

    //   payload.issues.push({
    //     origin,
    //     code: "too_big",
    //     maximum: def.value as number,
    //     input: payload.value,
    //     inclusive: def.inclusive,
    //     def,
    //     continue: !def.abort,
    //   });
    //   // return payload;
    // };
  }
);

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends base.$ZodCheckDef {
  check: "greater_than";
  value: util.Numeric;
  inclusive: boolean;
  // abort?: boolean;
}
export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends base.$ZodCheck<T> {
  _def: $ZodCheckGreaterThanDef;
  _issc: errors.$ZodIssueTooBig<T>;
}

export const $ZodCheckGreaterThan: base.$constructor<$ZodCheckGreaterThan> = base.$constructor(
  "$ZodCheckGreaterThan",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst._onattach = (inst) => {
      const curr = inst._computed.minimum ?? Number.NEGATIVE_INFINITY;
      if (def.value > curr) inst._computed.minimum = def.value;
    };

    inst._check = (payload) => {
      if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
        return;
      }

      payload.issues.push({
        origin: origin as "number",
        code: "too_small",
        minimum: def.value as number,
        input: payload.value,
        inclusive: def.inclusive,
        def,
        continue: !def.abort,
      });
    };

    // inst._checkB = (payload) => {
    //   if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
    //     return;
    //   }

    //   payload.issues.push({
    //     origin: origin as "number",
    //     code: "too_small",
    //     minimum: def.value as number,
    //     input: payload.value,
    //     inclusive: def.inclusive,
    //     def,
    //     continue: !def.abort,
    //   });
    //   // return payload;
    // };
  }
);

/////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034

interface $ZodCheckMultipleOfDef<T extends number | bigint> extends base.$ZodCheckDef {
  check: "multiple_of";
  value: T;
  // abort?: boolean;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueNotMultipleOf> | undefined;
}

export interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends base.$ZodCheck<T> {
  _def: $ZodCheckMultipleOfDef<T>;
  _issc: errors.$ZodIssueNotMultipleOf;
}

export const $ZodCheckMultipleOf: base.$constructor<$ZodCheckMultipleOf<number | bigint>> = base.$constructor(
  "$ZodCheckMultipleOf",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._onattach = (inst) => {
      inst._computed.multipleOf ??= def.value;
    };

    inst._check = (payload) => {
      if (typeof payload.value !== typeof def.value)
        throw new Error("Cannot mix number and bigint in multiple_of check.");
      const isMultiple =
        typeof payload.value === "bigint"
          ? payload.value % (def.value as bigint) === BigInt(0)
          : util.floatSafeRemainder(payload.value, def.value as number) === 0;

      if (isMultiple) return;
      payload.issues.push({
        origin: typeof payload.value as "number",
        code: "not_multiple_of",
        divisor: def.value as number,
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckFinite    /////
/////////////////////////////////////
// interface $ZodCheckFiniteDef extends base.$ZodCheckDef {
//   check: "finite";
// }

// export interface $ZodCheckFinite extends base.$ZodCheck<number> {
//   _def: $ZodCheckFiniteDef;
//   _issc:
//     | errors.$ZodIssueTooBig<"number", number>
//     | errors.$ZodIssueTooSmall<"number", number>;
// }

// export const $ZodCheckFinite: base.$constructor<$ZodCheckFinite> =
//   base.$constructor("$ZodCheckFinite", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._onattach = (inst) => {
//       inst["_computed"].finite = true;
//     };

//     inst._check = (payload) => {
//       if (Number.isFinite(payload.value)) return;
//       payload.issues.push({
//         origin: "number",
//         ...(payload.value === Number.POSITIVE_INFINITY
//           ? {
//               code: "too_big",
//               maximum: Number.POSITIVE_INFINITY,
//             }
//           : {
//               code: "too_small",
//               minimum: Number.NEGATIVE_INFINITY,
//             }),
//         // code: payload.value === Number.POSITIVE_INFINITY ? "too_big" : "too_big",
//         // maximum: Number.POSITIVE_INFINITY,
//         inclusive: false,
//         input: payload.value,
//         def,
//       });
//     };
//   });

/////////////////////////////////////
/////    $ZodCheckNumberFormat    /////
/////////////////////////////////////

export type $ZodNumberFormats = "int32" | "uint32" | "float32" | "float64" | "safeint";

export interface $ZodCheckNumberFormatDef extends base.$ZodCheckDef {
  check: "number_format";
  format: $ZodNumberFormats;
  // abort?: boolean;
}

export interface $ZodCheckNumberFormat extends base.$ZodCheck<number> {
  _def: $ZodCheckNumberFormatDef;
  _issc: errors.$ZodIssueInvalidType<number> | errors.$ZodIssueTooBig<"number"> | errors.$ZodIssueTooSmall<"number">;
}

export const $ZodCheckNumberFormat: base.$constructor<$ZodCheckNumberFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodNumber",
  (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";

    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = util.NUMBER_FORMAT_RANGES[def.format!];

    inst._onattach = (inst) => {
      inst._computed.format = def.format;
      inst._computed.minimum = minimum;
      inst._computed.maximum = maximum;
    };

    inst._check = (payload) => {
      const input = payload.value;

      if (isInt) {
        if (!Number.isInteger(input)) {
          // invalid_type issue
          payload.issues.push({
            expected: origin,
            format: def.format,
            code: "invalid_type",
            input,
            def,
          });

          return;

          // not_multiple_of issue
          // payload.issues.push({
          //   code: "not_multiple_of",
          //   origin: "number",
          //   input,
          //   def,
          //   divisor: 1,
          // });
        }
        if (!Number.isSafeInteger(input)) {
          // origin;
          if (input > 0) {
            // too_big
            payload.issues.push({
              input,
              code: "too_big",
              maximum: Number.MAX_SAFE_INTEGER,
              note: "Integers must be within the the safe integer range.",
              def,
              origin,
              continue: !def.abort,
            });
          } else {
            // too_small
            payload.issues.push({
              input,
              code: "too_small",
              minimum: Number.MIN_SAFE_INTEGER,
              note: "Integers must be within the safe integer range.",
              def,
              origin,
              continue: !def.abort,
            });
          }

          return;
        }
      }

      if (input < minimum) {
        payload.issues.push({
          origin: "number",
          input: input as number,
          code: "too_small",
          minimum: minimum as number,
          inclusive: true,
          def,
          continue: !def.abort,
        });
      }

      if (input > maximum) {
        payload.issues.push({
          origin: "number",
          input,
          code: "too_big",
          maximum,
          def,
        } as any);
      }
    };
  }
);

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
  _def: $ZodCheckBigIntFormatDef;
  _issc: errors.$ZodIssueTooBig<"bigint"> | errors.$ZodIssueTooSmall<"bigint">;
}

export const $ZodCheckBigIntFormat: base.$constructor<$ZodCheckBigIntFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodCheckBigIntFormat",
  (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks

    const [minimum, maximum] = util.BIGINT_FORMAT_RANGES[def.format!];

    inst._onattach = (inst) => {
      inst._computed.format = def.format;
      inst._computed.minimum = minimum;
      inst._computed.maximum = maximum;
    };

    inst._check = (payload) => {
      const input = payload.value;

      if (input < minimum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_small",
          minimum: minimum as any,
          inclusive: true,
          def,
          continue: !def.abort,
        });
      }

      if (input > maximum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_big",
          maximum,
          def,
        } as any);
      }
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMaxSize    /////
//////////////////////////////////
// function getSize(input: any): {
//   type: "string" | "array" | "set" | "file";
//   size: number;
// } {
//   if (typeof input === "string") return { type: "string", size: input.length };
//   if (Array.isArray(input)) return { type: "array", size: input.length };
//   if (input instanceof Set) return { type: "set", size: input.size };
//   if (input instanceof File) return { type: "file", size: input.size };
//   throw new Error(
//     `Invalid input for size check: ${input?.constructor?.name ?? typeof input}. This is a problem with Zod, please file an issue.`
//   );
// }

interface $ZodCheckMaxSizeDef extends base.$ZodCheckDef {
  check: "max_size";
  maximum: number;
}
export interface $ZodCheckMaxSize<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _def: $ZodCheckMaxSizeDef;
  _issc: errors.$ZodIssueTooBig<T>;
}

export const $ZodCheckMaxSize: base.$constructor<$ZodCheckMaxSize> = base.$constructor(
  "$ZodCheckMaxSize",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).size !== undefined;
    };

    inst._onattach = (inst) => {
      const curr = (inst._computed.maximum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.maximum > curr) inst._computed.maximum = def.maximum;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const size = input.size;

      if (size <= def.maximum) return;
      const origin = input instanceof Set ? "set" : input instanceof File ? "file" : "unknown";
      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.maximum,
        input,
        def,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends base.$ZodCheckDef {
  check: "min_size";
  minimum: number;
}
export interface $ZodCheckMinSize<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _def: $ZodCheckMinSizeDef;
  _issc: errors.$ZodIssueTooSmall<T>;
}

export const $ZodCheckMinSize: base.$constructor<$ZodCheckMinSize> = base.$constructor(
  "$ZodCheckMinSize",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).size !== undefined;
    };

    inst._onattach = (inst) => {
      const curr = (inst._computed.minimum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.minimum > curr) inst._computed.minimum = def.minimum;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const size = input.size;

      if (size >= def.minimum) return;
      const origin = input instanceof Set ? "set" : input instanceof File ? "file" : "unknown";
      payload.issues.push({
        origin,
        code: "too_small",
        minimum: def.minimum,
        input,
        def,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends base.$ZodCheckDef {
  size: number;
}
export interface $ZodCheckSizeEquals<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _def: $ZodCheckSizeEqualsDef;
  _issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
}

export const $ZodCheckSizeEquals: base.$constructor<$ZodCheckSizeEquals> = base.$constructor(
  "$ZodCheckSizeEquals",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).size !== undefined;
    };

    inst._onattach = (inst) => {
      inst._computed.minimum = def.size;
      inst._computed.maximum = def.size;
      inst._computed.size = def.size;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const size = input.size;
      if (size === def.size) return;
      const origin = input instanceof Set ? "set" : input instanceof File ? "file" : "unknown";
      const tooBig = size > def.size;
      payload.issues.push({
        origin,
        ...(tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size }),
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMaxLength    /////
//////////////////////////////////

interface $ZodCheckMaxLengthDef extends base.$ZodCheckDef {
  check: "max_length";
  maximum: number;
}
export interface $ZodCheckMaxLength<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _def: $ZodCheckMaxLengthDef;
  _issc: errors.$ZodIssueTooBig<T>;
}

export const $ZodCheckMaxLength: base.$constructor<$ZodCheckMaxLength> = base.$constructor(
  "$ZodCheckMaxLength",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).length !== undefined;
    };

    inst._onattach = (inst) => {
      const curr = (inst._computed.maximum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.maximum > curr) inst._computed.maximum = def.maximum;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const length = input.length;

      if (length <= def.maximum) return;
      const origin = typeof input === "string" ? "string" : Array.isArray(input) ? "array" : "unknown";
      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.maximum,
        input,
        def,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMinLength    /////
//////////////////////////////////
interface $ZodCheckMinLengthDef extends base.$ZodCheckDef {
  check: "min_length";
  minimum: number;
}
export interface $ZodCheckMinLength<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _def: $ZodCheckMinLengthDef;
  _issc: errors.$ZodIssueTooSmall<T>;
}

export const $ZodCheckMinLength: base.$constructor<$ZodCheckMinLength> = base.$constructor(
  "$ZodCheckMinLength",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).length !== undefined;
    };

    inst._onattach = (inst) => {
      const curr = (inst._computed.minimum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.minimum > curr) inst._computed.minimum = def.minimum;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const length = input.length;

      if (length >= def.minimum) return;
      const origin = input instanceof Set ? "set" : input instanceof File ? "file" : "unknown";
      payload.issues.push({
        origin,
        code: "too_small",
        minimum: def.minimum,
        input,
        def,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckLengthEquals    /////
/////////////////////////////////////
interface $ZodCheckLengthEqualsDef extends base.$ZodCheckDef {
  check: "length_equals";
  length: number;
}
export interface $ZodCheckLengthEquals<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _def: $ZodCheckLengthEqualsDef;
  _issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
}

export const $ZodCheckLengthEquals: base.$constructor<$ZodCheckLengthEquals> = base.$constructor(
  "$ZodCheckLengthEquals",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._when = (payload) => {
      const val = payload.value;
      return !!val && (val as any).length !== undefined;
    };

    inst._onattach = (inst) => {
      inst._computed.minimum = def.length;
      inst._computed.maximum = def.length;
      inst._computed.length = def.length;
    };

    inst._check = (payload) => {
      const input = payload.value;
      const length = input.length;
      if (length === def.length) return;
      const origin = input instanceof Set ? "set" : input instanceof File ? "file" : "unknown";
      const tooBig = length > def.length;
      payload.issues.push({
        origin,
        ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////////////
/////    $ZodCheckStringFormatRegex    /////
/////////////////////////////////////////////
export interface $ZodCheckStringFormatDef<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends base.$ZodCheckDef {
  check: "string_format";
  format: Format;
  pattern?: RegExp | undefined;
  // abort?: boolean;
}

export interface $ZodCheckStringFormat extends base.$ZodCheck<string> {
  _def: $ZodCheckStringFormatDef;
  _issc: errors.$ZodIssueInvalidStringFormat;
}

export const $ZodCheckStringFormat: base.$constructor<$ZodCheckStringFormat> = base.$constructor(
  "$ZodCheckStringFormat",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._onattach = (inst) => {
      inst._computed.format = def.format;
      if (def.pattern) inst._computed.pattern = def.pattern;
    };

    inst._check = (payload) => {
      if (!def.pattern) throw new Error("Not implemented.");
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
        def,
        continue: !def.abort,
      });
    };
  }
);

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

export const $ZodCheckRegex: base.$constructor<$ZodCheckRegex> = base.$constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
});

///////////////////////////////////
/////    $ZodCheckJSONString    /////
///////////////////////////////////
interface $ZodCheckJSONStringDef extends $ZodCheckStringFormatDef<"json_string"> {
  // check: "string_format";
  // format: "json_string";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckJSONString extends $ZodCheckStringFormat {
  _def: $ZodCheckJSONStringDef;
}

export const $ZodCheckJSONString: base.$constructor<$ZodCheckJSONString> = base.$constructor(
  "$ZodCheckJSONString",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      try {
        JSON.parse(payload.value);
        return;
      } catch (_) {
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: def.format,
          input: payload.value,
          def,
          continue: !def.abort,
        });
      }
    };
  }
);

//////////////////////////////////////
/////    $ZodCheckLowerCase    /////
//////////////////////////////////////
interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef<"lowercase"> {
  // check: "string_format";
  // format: "lowercase";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckLowerCase extends $ZodCheckStringFormat {
  _def: $ZodCheckLowerCaseDef;
}

export const $ZodCheckLowerCase: base.$constructor<$ZodCheckLowerCase> = base.$constructor(
  "$ZodCheckLowerCase",
  (inst, def) => {
    def.pattern ??= regexes.lowercaseRegex;
    $ZodCheckStringFormat.init(inst, def);
  }
);

//////////////////////////////////////
/////    $ZodCheckUpperCase    /////
//////////////////////////////////////
interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef<"uppercase"> {
  // check: "string_format";
  // format: "uppercase";
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckUpperCase extends $ZodCheckStringFormat {
  _def: $ZodCheckUpperCaseDef;
}

export const $ZodCheckUpperCase: base.$constructor<$ZodCheckUpperCase> = base.$constructor(
  "$ZodCheckUpperCase",
  (inst, def) => {
    def.pattern ??= regexes.uppercaseRegex;
    $ZodCheckStringFormat.init(inst, def);
  }
);

///////////////////////////////////
/////    $ZodCheckIncludes    /////
///////////////////////////////////
interface $ZodCheckIncludesDef extends $ZodCheckStringFormatDef<"includes"> {
  // check: "includes";
  includes: string;
  position?: number | undefined;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}

export interface $ZodCheckIncludes extends $ZodCheckStringFormat {
  _def: $ZodCheckIncludesDef;
}

export const $ZodCheckIncludes: base.$constructor<$ZodCheckIncludes> = base.$constructor(
  "$ZodCheckIncludes",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      if (payload.value.includes(def.includes, def.position)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "includes",
        includes: def.includes,
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckStartsWith    /////
/////////////////////////////////////
interface $ZodCheckStartsWithDef extends $ZodCheckStringFormatDef<"starts_with"> {
  prefix: string;
}
export interface $ZodCheckStartsWith extends $ZodCheckStringFormat {
  _def: $ZodCheckStartsWithDef;
}

export const $ZodCheckStartsWith: base.$constructor<$ZodCheckStartsWith> = base.$constructor(
  "$ZodCheckStartsWith",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      if (payload.value.startsWith(def.prefix)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "starts_with",
        prefix: def.prefix,
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends $ZodCheckStringFormatDef<"ends_with"> {
  // check: "ends_with";
  suffix: string;
  // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
}
export interface $ZodCheckEndsWith extends $ZodCheckStringFormat {
  _def: $ZodCheckEndsWithDef;
}

export const $ZodCheckEndsWith: base.$constructor<$ZodCheckEndsWith> = base.$constructor(
  "$ZodCheckEndsWith",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      if (payload.value.endsWith(def.suffix)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "ends_with",
        suffix: def.suffix,
        input: payload.value,
        def,
        continue: !def.abort,
      });
    };
  }
);

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
//   _def: $ZodCheckPropertyDef;
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

export interface $ZodCheckProperty<T extends object = object> extends base.$ZodCheck<T> {
  _def: $ZodCheckPropertyDef;
  _issc: errors.$ZodIssue;
}

export const $ZodCheckProperty: base.$constructor<$ZodCheckProperty> = base.$constructor(
  "$ZodCheckProperty",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      if (typeof payload.value !== "object") {
        // invalid_type
        payload.issues.push({
          origin: "object",
          code: "invalid_type",
          expected: "object",
          input: payload.value,
          def: { error: def?.error }, // do not include def.abort if it exists
        });
        return;
      }

      const result = def.schema._run(
        {
          value: (payload.value as any)[def.property],
          issues: [],
          $payload: true,
        },
        {}
      );

      if (result instanceof Promise) {
        return result.then((result) => {
          if (result.issues.length) {
            payload.issues.push(...base.$prefixIssues(def.property, result.issues));
          }
        });
      }
      if (result.issues.length) {
        payload.issues.push(...base.$prefixIssues(def.property, result.issues));
      }
      return;
    };
  }
);

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
//   _def: $ZodCheckFileTypeDef;
// }

// export const $ZodCheckFileType: base.$constructor<$ZodCheckFileType> =
//   base.$constructor("$ZodCheckFileType", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._check = (payload) => {
//       if (def.fileTypes.includes(payload.value.type as util.MimeTypes)) return;
//       payload.issues.push({
//         origin: "file",
//         code: "invalid_value",
//         options: def.fileTypes,
//         input: payload.value.type,
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
//   _def: $ZodCheckFileNameDef;
// }

// export const $ZodCheckFileName: base.$constructor<$ZodCheckFileName> =
//   base.$constructor("$ZodCheckFileName", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._check = (payload) => {
//       if (def.fileName === payload.value.name) return;
//       payload.issues.push({
//         origin: "file",
//         code: "invalid_value",
//         options: [def.fileName],
//         input: payload.value,
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
  _def: $ZodCheckOverwriteDef<T>;
  _issc: never;
}

export const $ZodCheckOverwrite: base.$constructor<$ZodCheckOverwrite> = base.$constructor(
  "$ZodCheckOverwrite",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._check = (payload) => {
      payload.value = def.tx(payload.value);
    };
  }
);

// ///////////////////////////////
// /////    $ZodCheckTrim    /////
// ///////////////////////////////
// export interface $ZodCheckTrimDef extends base.$ZodCheckDef {
//   check: "trim";
//   error?: errors.$ZodErrorMap<never> | undefined;
// }
// export interface $ZodCheckTrim extends base.$ZodCheck<string> {
//   _def: $ZodCheckTrimDef;
// }

// export const $ZodCheckTrim: base.$constructor<$ZodCheckTrim> =
//   base.$constructor("$ZodCheckTrim", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._check = (payload) => {
//       payload.value = payload.value.trim();
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
//   _def: $ZodCheckNormalizeDef;
// }

// export const $ZodCheckNormalize: base.$constructor<$ZodCheckNormalize> =
//   base.$constructor("$ZodCheckNormalize", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._check = (payload) => {
//       payload.value = payload.value.normalize();
//     };
//   });
