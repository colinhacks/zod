import * as base from "./base.js";
import type * as errors from "./errors.js";
import * as regexes from "./regexes.js";
import * as util from "./util.js";

///////////////////////////////////////
/////      $ZodCheckLessThan      /////
///////////////////////////////////////
interface $ZodCheckLessThanDef extends base._$ZodCheckDef {
  check: "less_than";
  value: util.Numeric;
  inclusive: boolean;
}

export interface _$ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends base._$ZodCheck<T> {
  def: $ZodCheckLessThanDef;
  issc: errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckLessThan<T>;
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

    inst._zod.onattach = (inst) => {
      const curr = inst._zod.computed.maximum ?? Number.POSITIVE_INFINITY;

      if (def.value < curr) inst._zod.computed.maximum = def.value;
    };

    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
        return;
      }

      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.value as number,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
interface $ZodCheckGreaterThanDef extends base._$ZodCheckDef {
  check: "greater_than";
  value: util.Numeric;
  inclusive: boolean;
}

export interface _$ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends base._$ZodCheck<T> {
  def: $ZodCheckGreaterThanDef;
  issc: errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckGreaterThan<T>;
}

export const $ZodCheckGreaterThan: base.$constructor<$ZodCheckGreaterThan> = base.$constructor(
  "$ZodCheckGreaterThan",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value as "number" | "bigint" | "object"];

    inst._zod.onattach = (inst) => {
      const curr = inst._zod.computed.minimum ?? Number.NEGATIVE_INFINITY;
      if (def.value > curr) inst._zod.computed.minimum = def.value;
    };

    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
        return;
      }

      payload.issues.push({
        origin: origin as "number",
        code: "too_small",
        minimum: def.value as number,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034

interface $ZodCheckMultipleOfDef<T extends number | bigint = number | bigint> extends base._$ZodCheckDef {
  check: "multiple_of";
  value: T;
}

export interface _$ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends base._$ZodCheck<T> {
  def: $ZodCheckMultipleOfDef<T>;
  issc: errors.$ZodIssueNotMultipleOf;
}

export interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMultipleOf<T>;
}

export const $ZodCheckMultipleOf: base.$constructor<$ZodCheckMultipleOf<number | bigint>> = base.$constructor(
  "$ZodCheckMultipleOf",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.onattach = (inst) => {
      inst._zod.computed.multipleOf ??= def.value;
    };

    inst._zod.check = (payload) => {
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
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckFinite    /////
/////////////////////////////////////
// interface $ZodCheckFiniteDef extends base._$ZodCheckDef {
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

//     inst._zod.onattach = (inst) => {
//       inst["_computed"].finite = true;
//     };

//     inst._zod.check = (payload) => {
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
//         inst,
//       });
//     };
//   });

///////////////////////////////////////
/////    $ZodCheckNumberFormat    /////
///////////////////////////////////////

export type $ZodNumberFormats = "int32" | "uint32" | "float32" | "float64" | "safeint";

export interface $ZodCheckNumberFormatDef extends base._$ZodCheckDef {
  check: "number_format";
  format: $ZodNumberFormats;
  // abort?: boolean;
}

export interface _$ZodCheckNumberFormat extends base._$ZodCheck<number> {
  def: $ZodCheckNumberFormatDef;
  issc: errors.$ZodIssueInvalidType<number> | errors.$ZodIssueTooBig<"number"> | errors.$ZodIssueTooSmall<"number">;
}

export interface $ZodCheckNumberFormat extends base.$ZodCheck<number> {
  _zod: _$ZodCheckNumberFormat;
}

export const $ZodCheckNumberFormat: base.$constructor<$ZodCheckNumberFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodNumber",
  (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";

    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = util.NUMBER_FORMAT_RANGES[def.format!];

    inst._zod.onattach = (inst) => {
      inst._zod.computed.format = def.format;
      inst._zod.computed.minimum = minimum;
      inst._zod.computed.maximum = maximum;
      if (isInt) {
        inst._zod.computed.pattern = regexes.intRegex;
      }
    };

    inst._zod.check = (payload) => {
      const input = payload.value;

      if (isInt) {
        if (!Number.isInteger(input)) {
          // invalid_type issue
          payload.issues.push({
            expected: origin,
            format: def.format,
            code: "invalid_type",
            input,
            inst,
          });

          return;

          // not_multiple_of issue
          // payload.issues.push({
          //   code: "not_multiple_of",
          //   origin: "number",
          //   input,
          //   inst,
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
              inst,
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
              inst,
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
          inst,
          continue: !def.abort,
        });
      }

      if (input > maximum) {
        payload.issues.push({
          origin: "number",
          input,
          code: "too_big",
          maximum,
          inst,
        } as any);
      }
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckBigIntFormat    /////
/////////////////////////////////////

export type $ZodBigIntFormats = "int64" | "uint64";

export interface $ZodCheckBigIntFormatDef extends base._$ZodCheckDef {
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

export interface _$ZodCheckBigIntFormat extends base._$ZodCheck<bigint> {
  def: $ZodCheckBigIntFormatDef;
  issc: errors.$ZodIssueTooBig<"bigint"> | errors.$ZodIssueTooSmall<"bigint">;
}

export interface $ZodCheckBigIntFormat extends base.$ZodCheck<bigint> {
  _zod: _$ZodCheckBigIntFormat;
}

export const $ZodCheckBigIntFormat: base.$constructor<$ZodCheckBigIntFormat> = /*@__PURE__*/ base.$constructor(
  "$ZodCheckBigIntFormat",
  (inst, def) => {
    base.$ZodCheck.init(inst, def); // no format checks

    const [minimum, maximum] = util.BIGINT_FORMAT_RANGES[def.format!];

    inst._zod.onattach = (inst) => {
      inst._zod.computed.format = def.format;
      inst._zod.computed.minimum = minimum;
      inst._zod.computed.maximum = maximum;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;

      if (input < minimum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_small",
          minimum: minimum as any,
          inclusive: true,
          inst,
          continue: !def.abort,
        });
      }

      if (input > maximum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_big",
          maximum,
          inst,
        } as any);
      }
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMaxSize    /////
//////////////////////////////////
interface $ZodCheckMaxSizeDef extends base._$ZodCheckDef {
  check: "max_size";
  maximum: number;
}

export interface _$ZodCheckMaxSize<T extends util.HasSize = util.HasSize> extends base._$ZodCheck<T> {
  def: $ZodCheckMaxSizeDef;
  issc: errors.$ZodIssueTooBig<T>;
}

export interface $ZodCheckMaxSize<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMaxSize<T>;
}

export const $ZodCheckMaxSize: base.$constructor<$ZodCheckMaxSize> = base.$constructor(
  "$ZodCheckMaxSize",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).size !== undefined;
    };

    inst._zod.onattach = (inst) => {
      const curr = (inst._zod.computed.maximum ?? Number.POSITIVE_INFINITY) as number;
      if (def.maximum < curr) inst._zod.computed.maximum = def.maximum;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;

      if (size <= def.maximum) return;
      payload.issues.push({
        origin: util.getSizableOrigin(input),
        code: "too_big",
        maximum: def.maximum,
        input,
        inst,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMinSize    /////
//////////////////////////////////
interface $ZodCheckMinSizeDef extends base._$ZodCheckDef {
  check: "min_size";
  minimum: number;
}

export interface _$ZodCheckMinSize<T extends util.HasSize = util.HasSize> extends base._$ZodCheck<T> {
  def: $ZodCheckMinSizeDef;
  issc: errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckMinSize<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMinSize<T>;
}

export const $ZodCheckMinSize: base.$constructor<$ZodCheckMinSize> = base.$constructor(
  "$ZodCheckMinSize",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).size !== undefined;
    };

    inst._zod.onattach = (inst) => {
      const curr = (inst._zod.computed.minimum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.minimum > curr) inst._zod.computed.minimum = def.minimum;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;

      if (size >= def.minimum) return;
      payload.issues.push({
        origin: util.getSizableOrigin(input),
        code: "too_small",
        minimum: def.minimum,
        input,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckSizeEquals    /////
/////////////////////////////////////
interface $ZodCheckSizeEqualsDef extends base._$ZodCheckDef {
  size: number;
}

export interface _$ZodCheckSizeEquals<T extends util.HasSize = util.HasSize> extends base._$ZodCheck<T> {
  def: $ZodCheckSizeEqualsDef;
  issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckSizeEquals<T extends util.HasSize = util.HasSize> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckSizeEquals<T>;
}

export const $ZodCheckSizeEquals: base.$constructor<$ZodCheckSizeEquals> = base.$constructor(
  "$ZodCheckSizeEquals",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).size !== undefined;
    };

    inst._zod.onattach = (inst) => {
      inst._zod.computed.minimum = def.size;
      inst._zod.computed.maximum = def.size;
      inst._zod.computed.size = def.size;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;
      if (size === def.size) return;

      const tooBig = size > def.size;
      payload.issues.push({
        origin: util.getSizableOrigin(input),
        ...(tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size }),
        input: payload.value,
        inst,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMaxLength    /////
//////////////////////////////////

interface $ZodCheckMaxLengthDef extends base._$ZodCheckDef {
  check: "max_length";
  maximum: number;
}

export interface _$ZodCheckMaxLength<T extends util.HasLength = util.HasLength> extends base._$ZodCheck<T> {
  def: $ZodCheckMaxLengthDef;
  issc: errors.$ZodIssueTooBig<T>;
}

export interface $ZodCheckMaxLength<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMaxLength<T>;
}

export const $ZodCheckMaxLength: base.$constructor<$ZodCheckMaxLength> = base.$constructor(
  "$ZodCheckMaxLength",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).length !== undefined;
    };

    inst._zod.onattach = (inst) => {
      const curr = (inst._zod.computed.maximum ?? Number.POSITIVE_INFINITY) as number;
      if (def.maximum < curr) inst._zod.computed.maximum = def.maximum;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;

      if (length <= def.maximum) return;
      const origin = util.getLengthableOrigin(input);
      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.maximum,
        input,
        inst,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////    $ZodCheckMinLength    /////
//////////////////////////////////
interface $ZodCheckMinLengthDef extends base._$ZodCheckDef {
  check: "min_length";
  minimum: number;
}

export interface _$ZodCheckMinLength<T extends util.HasLength = util.HasLength> extends base._$ZodCheck<T> {
  def: $ZodCheckMinLengthDef;
  issc: errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckMinLength<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMinLength<T>;
}

export const $ZodCheckMinLength: base.$constructor<$ZodCheckMinLength> = base.$constructor(
  "$ZodCheckMinLength",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).length !== undefined;
    };

    inst._zod.onattach = (inst) => {
      const curr = (inst._zod.computed.minimum ?? Number.NEGATIVE_INFINITY) as number;
      if (def.minimum > curr) inst._zod.computed.minimum = def.minimum;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;

      if (length >= def.minimum) return;
      const origin = util.getLengthableOrigin(input);
      payload.issues.push({
        origin,
        code: "too_small",
        minimum: def.minimum,
        input,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////
/////    $ZodCheckLengthEquals    /////
/////////////////////////////////////
interface $ZodCheckLengthEqualsDef extends base._$ZodCheckDef {
  check: "length_equals";
  length: number;
}

export interface _$ZodCheckLengthEquals<T extends util.HasLength = util.HasLength> extends base._$ZodCheck<T> {
  def: $ZodCheckLengthEqualsDef;
  issc: errors.$ZodIssueTooBig<T> | errors.$ZodIssueTooSmall<T>;
}

export interface $ZodCheckLengthEquals<T extends util.HasLength = util.HasLength> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckLengthEquals<T>;
}

export const $ZodCheckLengthEquals: base.$constructor<$ZodCheckLengthEquals> = base.$constructor(
  "$ZodCheckLengthEquals",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.when = (payload) => {
      const val = payload.value;
      return !util.nullish(val) && (val as any).length !== undefined;
    };

    inst._zod.onattach = (inst) => {
      inst._zod.computed.minimum = def.length;
      inst._zod.computed.maximum = def.length;
      inst._zod.computed.length = def.length;
    };

    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;
      if (length === def.length) return;
      const origin = util.getLengthableOrigin(input);
      const tooBig = length > def.length;
      payload.issues.push({
        origin,
        ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
        input: payload.value,
        inst,
        continue: !def.abort,
      });
    };
  }
);

/////////////////////////////////////////////
/////    $ZodCheckStringFormatRegex    /////
/////////////////////////////////////////////
export interface $ZodCheckStringFormatDef<Format extends errors.$ZodStringFormats = errors.$ZodStringFormats>
  extends base._$ZodCheckDef {
  check: "string_format";
  format: Format;
  pattern?: RegExp | undefined;
}

export interface _$ZodCheckStringFormat extends base._$ZodCheck<string> {
  def: $ZodCheckStringFormatDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckStringFormat extends base.$ZodCheck<string> {
  _zod: _$ZodCheckStringFormat;
}

export const $ZodCheckStringFormat: base.$constructor<$ZodCheckStringFormat> = base.$constructor(
  "$ZodCheckStringFormat",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.onattach = (inst) => {
      inst._zod.computed.format = def.format;
      if (def.pattern) inst._zod.computed.pattern = def.pattern;
    };

    inst._zod.check = (payload) => {
      if (!def.pattern) throw new Error("Not implemented.");
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
        inst,
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

export interface _$ZodCheckRegex extends base._$ZodCheck<string> {
  def: $ZodCheckRegexDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckRegex extends $ZodCheckStringFormat {
  _zod: _$ZodCheckRegex;
}

export const $ZodCheckRegex: base.$constructor<$ZodCheckRegex> = base.$constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);

  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value)) return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort,
    });
  };
});

///////////////////////////////////
/////    $ZodCheckJSONString    /////
///////////////////////////////////
// interface $ZodCheckJSONStringDef extends $ZodCheckStringFormatDef<"json_string"> {
//   // check: "string_format";
//   // format: "json_string";
//   // error?: errors.$ZodErrorMap<errors.$ZodIssueInvalidStringFormat> | undefined;
// }

// export interface $ZodCheckJSONString extends $ZodCheckStringFormat {
//   _def: $ZodCheckJSONStringDef;
// }

// export const $ZodCheckJSONString: base.$constructor<$ZodCheckJSONString> = base.$constructor(
//   "$ZodCheckJSONString",
//   (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._zod.check = (payload) => {
//       try {
//         JSON.parse(payload.value);
//         return;
//       } catch (_) {
//         payload.issues.push({
//           origin: "string",
//           code: "invalid_format",
//           format: def.format,
//           input: payload.value,
//           inst,
//           continue: !def.abort,
//         });
//       }
//     };
//   }
// );

//////////////////////////////////////
/////    $ZodCheckLowerCase    /////
//////////////////////////////////////
interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef<"lowercase"> {}

export interface _$ZodCheckLowerCase extends base._$ZodCheck<string> {
  def: $ZodCheckLowerCaseDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckLowerCase extends $ZodCheckStringFormat {
  _zod: _$ZodCheckLowerCase;
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
interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef<"uppercase"> {}

export interface _$ZodCheckUpperCase extends base._$ZodCheck<string> {
  def: $ZodCheckUpperCaseDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckUpperCase extends $ZodCheckStringFormat {
  _zod: _$ZodCheckUpperCase;
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
  includes: string;
  position?: number | undefined;
}

export interface _$ZodCheckIncludes extends base._$ZodCheck<string> {
  def: $ZodCheckIncludesDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckIncludes extends $ZodCheckStringFormat {
  _zod: _$ZodCheckIncludes;
}

export const $ZodCheckIncludes: base.$constructor<$ZodCheckIncludes> = base.$constructor(
  "$ZodCheckIncludes",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.check = (payload) => {
      if (payload.value.includes(def.includes, def.position)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "includes",
        includes: def.includes,
        input: payload.value,
        inst,
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

export interface _$ZodCheckStartsWith extends base._$ZodCheck<string> {
  def: $ZodCheckStartsWithDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckStartsWith extends $ZodCheckStringFormat {
  _zod: _$ZodCheckStartsWith;
}

export const $ZodCheckStartsWith: base.$constructor<$ZodCheckStartsWith> = base.$constructor(
  "$ZodCheckStartsWith",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);
    inst._zod.onattach = (inst) => {
      inst._zod.computed.pattern = new RegExp(`^${util.escapeRegex(def.prefix)}.*`);
    };

    inst._zod.check = (payload) => {
      if (payload.value.startsWith(def.prefix)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "starts_with",
        prefix: def.prefix,
        input: payload.value,
        inst,
        continue: !def.abort,
      });
    };
  }
);

//////////////////////////////////
/////   $ZodCheckEndsWith    /////
//////////////////////////////////
interface $ZodCheckEndsWithDef extends $ZodCheckStringFormatDef<"ends_with"> {
  suffix: string;
}

export interface _$ZodCheckEndsWith extends base._$ZodCheck<string> {
  def: $ZodCheckEndsWithDef;
  issc: errors.$ZodIssueInvalidStringFormat;
}

export interface $ZodCheckEndsWith extends $ZodCheckStringFormat {
  _zod: _$ZodCheckEndsWith;
}

export const $ZodCheckEndsWith: base.$constructor<$ZodCheckEndsWith> = base.$constructor(
  "$ZodCheckEndsWith",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.onattach = (inst) => {
      inst._zod.computed.pattern = new RegExp(`.*${util.escapeRegex(def.suffix)}$`);
    };

    inst._zod.check = (payload) => {
      if (payload.value.endsWith(def.suffix)) return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "ends_with",
        suffix: def.suffix,
        input: payload.value,
        inst,
        continue: !def.abort,
      });
    };
  }
);

///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
function handleCheckPropertyResult(
  result: base.$ParsePayload<unknown>,
  payload: base.$ParsePayload<unknown>,
  property: string
) {
  if (result.issues.length) {
    payload.issues.push(...util.prefixIssues(property, result.issues));
  }
}
interface $ZodCheckPropertyDef extends base._$ZodCheckDef {
  check: "property";
  property: string;
  schema: base.$ZodType;
}

export interface _$ZodCheckProperty<T extends object = object> extends base._$ZodCheck<T> {
  def: $ZodCheckPropertyDef;
  issc: errors.$ZodIssue;
}

export interface $ZodCheckProperty<T extends object = object> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckProperty<T>;
}

export const $ZodCheckProperty: base.$constructor<$ZodCheckProperty> = base.$constructor(
  "$ZodCheckProperty",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.check = (payload) => {
      // if (typeof payload.value !== "object") {
      //   // invalid_type
      //   payload.issues.push({
      //     code: "invalid_type",
      //     expected: "object",
      //     input: payload.value,
      //     inst,
      //     // def: { error: def?.error }, // do not include def.abort if it exists
      //   });
      //   return;
      // }

      const result = def.schema._zod.run(
        {
          value: (payload.value as any)[def.property],
          issues: [],
          $payload: true,
        },
        {}
      );

      if (result instanceof Promise) {
        return result.then((result) => handleCheckPropertyResult(result, payload, def.property));
      }

      handleCheckPropertyResult(result, payload, def.property);
      return;
    };
  }
);

///////////////////////////////////
/////    $ZodCheckMimeType    /////
///////////////////////////////////
interface $ZodCheckMimeTypeDef extends base._$ZodCheckDef {
  check: "mime_type";
  mime: util.MimeTypes[];
}

export interface _$ZodCheckMimeType<T extends File = File> extends base._$ZodCheck<T> {
  def: $ZodCheckMimeTypeDef;
  issc: errors.$ZodIssueInvalidValue;
}

export interface $ZodCheckMimeType<T extends File = File> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckMimeType<T>;
}

export const $ZodCheckMimeType: base.$constructor<$ZodCheckMimeType> = base.$constructor(
  "$ZodCheckMimeType",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);
    const mimeSet = new Set(def.mime);
    inst._zod.onattach = (inst) => {
      inst._zod.computed.mime = def.mime;
    };
    inst._zod.check = (payload) => {
      if (mimeSet.has(payload.value.type)) return;
      payload.issues.push({
        code: "invalid_value",
        values: def.mime,
        input: payload.value.type,
        path: ["type"],
        inst,
      });
    };
  }
);

///////////////////////////////////
/////    $ZodCheckFileName    /////
///////////////////////////////////
// interface $ZodCheckFileNameDef extends base._$ZodCheckDef {
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

//     inst._zod.check = (payload) => {
//       if (def.fileName === payload.value.name) return;
//       payload.issues.push({
//         origin: "file",
//         code: "invalid_value",
//         options: [def.fileName],
//         input: payload.value,
//         path: ["name"],
//         inst,
//       });
//     };
//   });

///////////////////////////////////
/////    $ZodCheckOverwrite    /////
///////////////////////////////////
interface $ZodCheckOverwriteDef<T> extends base._$ZodCheckDef {
  check: "overwrite";
  tx(value: T): T;
}

export interface _$ZodCheckOverwrite<T = unknown> extends base._$ZodCheck<T> {
  def: $ZodCheckOverwriteDef<T>;
  issc: never;
}

export interface $ZodCheckOverwrite<T = unknown> extends base.$ZodCheck<T> {
  _zod: _$ZodCheckOverwrite<T>;
}

export const $ZodCheckOverwrite: base.$constructor<$ZodCheckOverwrite> = base.$constructor(
  "$ZodCheckOverwrite",
  (inst, def) => {
    base.$ZodCheck.init(inst, def);

    inst._zod.check = (payload) => {
      payload.value = def.tx(payload.value);
    };
  }
);

// ///////////////////////////////
// /////    $ZodCheckTrim    /////
// ///////////////////////////////
// export interface $ZodCheckTrimDef extends base._$ZodCheckDef {
//   check: "trim";
//   error?: errors.$ZodErrorMap<never> | undefined;
// }
// export interface $ZodCheckTrim extends base.$ZodCheck<string> {
//   _def: $ZodCheckTrimDef;
// }

// export const $ZodCheckTrim: base.$constructor<$ZodCheckTrim> =
//   base.$constructor("$ZodCheckTrim", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._zod.check = (payload) => {
//       payload.value = payload.value.trim();
//     };
//   });

// //////////////////////////////////////
// /////    $ZodCheckNormalize    /////
// //////////////////////////////////////
// interface $ZodCheckNormalizeDef extends base._$ZodCheckDef {
//   check: "normalize";
//   error?: errors.$ZodErrorMap<never> | undefined;
// }

// export interface $ZodCheckNormalize extends base.$ZodCheck<string> {
//   _def: $ZodCheckNormalizeDef;
// }

// export const $ZodCheckNormalize: base.$constructor<$ZodCheckNormalize> =
//   base.$constructor("$ZodCheckNormalize", (inst, def) => {
//     base.$ZodCheck.init(inst, def);

//     inst._zod.check = (payload) => {
//       payload.value = payload.value.normalize();
//     };
//   });

export type $ZodChecks =
  | $ZodCheckLessThan
  | $ZodCheckGreaterThan
  | $ZodCheckMultipleOf
  // | $ZodCheckFinite
  | $ZodCheckNumberFormatDef
  | $ZodCheckNumberFormat
  | $ZodCheckBigIntFormatDef
  | $ZodCheckBigIntFormat
  | $ZodCheckMaxSize
  | $ZodCheckMinSize
  | $ZodCheckSizeEquals
  | $ZodCheckMaxLength
  | $ZodCheckMinLength
  | $ZodCheckLengthEquals
  | $ZodCheckStringFormatDef
  | $ZodCheckStringFormat
  | $ZodCheckRegex
  // | $ZodCheckJSONString
  | $ZodCheckLowerCase
  | $ZodCheckUpperCase
  | $ZodCheckIncludes
  | $ZodCheckStartsWith
  | $ZodCheckEndsWith
  // | $ZodCheckProperty
  | $ZodCheckProperty
  | $ZodCheckMimeType
  | $ZodCheckOverwrite;
