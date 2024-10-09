import * as checks from "./checks_v2.js";
import * as core from "./core.js";
import type * as err from "./errors_v2.js";
import * as parse from "./parse.js";
import * as regexes from "./regexes.js";
import type * as types from "./types.js";
import * as util from "./util.js";

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodCore      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

type $ZodDiscriminators = Array<{ key: PropertyKey; discs: $ZodDiscriminators } | Set<unknown>>;

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodString      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodStringDef extends core.$ZodTypeDef {
  type: "string";
  coerce: boolean;
  checks: core.$ZodCheck<string>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodString<Def extends $ZodStringDef = $ZodStringDef> extends core.$ZodType<string, string, Def> {
  _pattern: RegExp;
}

export const $ZodString: core.$constructor<$ZodString, $ZodStringDef> = core.$constructor("$ZodString", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._pattern = regexes.stringRegex;
  inst._typecheck ??= (input, ctx) => {
    // input;
    // do not overwrite subclass impl
    if (typeof input === "string") return input;
    return core.$ZodFailure.from(
      [{ origin: "string", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

//////////////////////////////   ZodStringFormat   //////////////////////////////

export interface $ZodStringFormatDef extends $ZodStringDef, checks._$ZodCheckStringFormatDef {
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType | err.$ZodIssueStringInvalidFormat> | undefined;
}

export interface $ZodStringFormat<Def extends $ZodStringFormatDef = $ZodStringFormatDef>
  extends $ZodString<Def>,
    checks._$ZodCheckStringFormat<Def> {
  _pattern: RegExp;
}

export const $ZodStringFormat: core.$constructor<$ZodStringFormat, $ZodStringFormatDef> = core.$constructor(
  "$ZodStringFormat",
  function (inst, def): void {
    $ZodString.init(inst, def);
    checks._$ZodCheckStringFormat(inst);
    inst.checks = [inst, ...inst.checks];
  }
);

//////////////////////////////   ZodUUID   //////////////////////////////

export interface $ZodUUIDDef extends $ZodStringFormatDef {
  check: "uuid";
}
export interface $ZodUUID extends $ZodStringFormat<$ZodUUIDDef> {}

export const $ZodUUID: core.$constructor<$ZodUUID, $ZodUUIDDef> = core.$constructor(
  "$ZodUUID",
  function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.pattern = regexes.uuidRegex;
  }
);

//////////////////////////////   ZodEmail   //////////////////////////////

export interface $ZodEmailDef extends $ZodStringFormatDef {
  check: "email";
}
export interface $ZodEmail extends $ZodStringFormat<$ZodEmailDef> {}

export const $ZodEmail: core.$constructor<$ZodEmail, $ZodEmailDef> = core.$constructor(
  "$ZodEmail",
  function (inst, def): void {
    $ZodStringFormat.init(inst, def);
    inst.pattern = regexes.emailRegex;
  }
);

//////////////////////////////   ZodURL   //////////////////////////////

export interface $ZodURLDef extends $ZodStringFormatDef {
  check: "url";
}

export interface $ZodURL extends $ZodStringFormat<$ZodURLDef> {}

export const $ZodURL: core.$constructor<$ZodURL, $ZodURLDef> = core.$constructor("$ZodURL", function (inst, def) {
  $ZodStringFormat.init(inst, def);
  inst.run = (ctx) => {
    try {
      const url = new URL(ctx.input);
      if (regexes.hostnameRegex.test(url.hostname)) return;
    } finally {
      ctx.addIssue({ origin: "string", code: "invalid_format", format: inst.check, input: ctx.input });
    }
  };
});

// todo: implement zodemoji
// todo: implement zoduuid
// todo: implement zoduuidv4
// todo: implement zoduuidv6
// todo: implement zodnanoid
// todo: implement zodguid
// todo: implement zodcuid
// todo: implement zodcuid2
// todo: implement zodulid
// todo: implement zodxid
// todo: implement zodksuid
// todo: implement zodiso_datetime
// todo: implement zodiso_date
// todo: implement zodiso_time
// todo: implement zodduration
// todo: implement zodip
// todo: implement zodipv4
// todo: implement zodipv6
// todo: implement zodbase64
// todo: implement zodjson_string
// todo: implement zode164
// todo: implement zodjwt

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export const NUMBER_FORMAT_RANGES: Record<$ZodNumberFormats, [number | bigint, number | bigint]> = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
  uint64: [0, BigInt("18446744073709551615")],
  float32: [-3.4028234663852886e38, 3.4028234663852886e38],
  float64: [-1.7976931348623157e308, 1.7976931348623157e308],
};

export interface $ZodNumberDef extends core.$ZodTypeDef {
  type: "number";
  format?: $ZodNumberFormats | undefined;
  coerce: boolean;
  checks: core.$ZodCheck<number>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export type $ZodIntegerFormats = "int32" | "uint32" | "int64" | "uint64" | "safeint";
export type $ZodFloatFormats = "float32" | "float64";
export type $ZodNumberFormats = $ZodIntegerFormats | $ZodFloatFormats;

export interface $ZodNumber extends core.$ZodType<number, unknown, $ZodNumberDef> {
  computed?: {
    minimum?: number | bigint;
    maximum?: number | bigint;
    multiple_of?: number;
  };
}

export interface $ZodNumberDef extends core.$ZodTypeDef {
  type: "number";
  coerce: boolean;
  checks: core.$ZodCheck<number>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNumber extends core.$ZodType<number, unknown, $ZodNumberDef> {
  _pattern: RegExp;
}

// only use for z.numeber()
export const $ZodNumberFast: core.$constructor<$ZodNumber, $ZodNumberDef> = core.$constructor(
  "$ZodNumber",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.numberRegex;
    inst._typecheck = (input, ctx) => {
      if (typeof input === "number") return input;
      return core.$ZodFailure.from(
        [{ origin: "number", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    };
  }
);

export const $ZodNumber: core.$constructor<$ZodNumber, $ZodNumberDef> = core.$constructor("$ZodNumber", (inst, def) => {
  inst.format = inst.format || "float64";
  $ZodNumberFast.init(inst, def); // no format checks
  // if format is integer:
  if (inst.format.includes("int")) {
    inst._pattern = regexes.intRegex;
  }
  const fastcheck = inst._typecheck; // super._typecheck
  inst._typecheck = (input, ctx) => {
    // if (typeof input === "number" && Number.isInteger(input)) return input;
    const result = fastcheck(input, ctx) as core.$SyncParseResult<number>;
    if (core.failed(result)) return result;
    let fail!: core.$ZodFailure;
    if (!Number.isInteger(result)) {
      fail = fail || core.$ZodFailure.empty(ctx);
      fail.addIssue({ origin: "number", code: "invalid_type", level: "abort", received: parse.t(result), input });
    }

    // const range = INT_RANGES[inst.format];
    const [minimum, maximum] = NUMBER_FORMAT_RANGES[inst.format!];

    if (result < minimum) {
      fail = fail || core.$ZodFailure.empty(ctx);
      fail.addIssue(
        { origin: "number", input: input as number, code: "too_small", minimum: minimum as number, inclusive: true },
        inst
      );
    }
    if (result > maximum) {
      fail = fail || core.$ZodFailure.empty(ctx);
      fail.addIssue({ origin: "number", input: input as number, code: "too_big", maximum } as any, inst);
    }
    return fail ?? result;
  };
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////                      ///////////
//////////      $ZodBoolean      //////////
//////////                      ///////////
///////////////////////////////////////////
///////////////////////////////////////////

export interface $ZodBooleanDef extends core.$ZodTypeDef {
  type: "boolean";
  coerce?: boolean;
  checks?: core.$ZodCheck<boolean>[];
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodBoolean extends core.$ZodType<boolean, unknown, $ZodBooleanDef> {
  _pattern: RegExp;
}

export const $ZodBoolean: core.$constructor<$ZodBoolean, $ZodBooleanDef> = core.$constructor(
  "$ZodBoolean",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.booleanRegex;
    inst._typecheck = (input, ctx) => {
      if (typeof input === "boolean") return input;
      return core.$ZodFailure.from(
        [{ origin: "boolean", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    };
  }
);

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodBigInt      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodBigIntDef extends core.$ZodTypeDef {
  type: "bigint";
  coerce: boolean;
  checks: core.$ZodCheck<bigint>[];
  error: err.$ZodErrorMap<err.$ZodIssueInvalidType>;
}

export interface $ZodBigInt extends core.$ZodType<bigint, unknown, $ZodBigIntDef> {
  _pattern: RegExp;
}

export const $ZodBigInt: core.$constructor<$ZodBigInt, $ZodBigIntDef> = core.$constructor("$ZodBigInt", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._pattern = regexes.bigintRegex;
  inst._typecheck = (input, ctx) => {
    if (typeof input === "bigint") return input;
    return core.$ZodFailure.from(
      [{ origin: "bigint", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////       $ZodSymbol       //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
export interface $ZodSymbolDef extends core.$ZodTypeDef {
  type: "symbol";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodSymbol extends core.$ZodType<symbol, unknown, $ZodSymbolDef> {}

export const $ZodSymbol: core.$constructor<$ZodSymbol, $ZodSymbolDef> = core.$constructor("$ZodSymbol", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (typeof input === "symbol") return input;
    return core.$ZodFailure.from(
      [{ origin: "symbol", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodUndefined     //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodUndefinedDef extends core.$ZodTypeDef {
  type: "undefined";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodUndefined extends core.$ZodType<undefined, undefined, $ZodUndefinedDef> {
  _pattern: RegExp;
}

export const $ZodUndefined: core.$constructor<$ZodUndefined, $ZodUndefinedDef> = core.$constructor(
  "$ZodUndefined",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._pattern = regexes.undefinedRegex;
    inst._typecheck = (input, ctx) => {
      if (typeof input === "undefined") return undefined;
      return core.$ZodFailure.from(
        [{ origin: "undefined", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    };
  }
);

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodNull      /////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export interface $ZodNullDef extends core.$ZodTypeDef {
  type: "null";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodNull extends core.$ZodType<null, null, $ZodNullDef> {
  _pattern: RegExp;
}

export const $ZodNull: core.$constructor<$ZodNull, $ZodNullDef> = core.$constructor("$ZodNull", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._pattern = regexes.nullRegex;
  inst._typecheck = (input, ctx) => {
    if (input === null) return null;
    return core.$ZodFailure.from(
      [{ origin: "null", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

//////////////////////////////////////
//////////////////////////////////////
//////////                  //////////
//////////      $ZodAny     //////////
//////////                  //////////
//////////////////////////////////////
//////////////////////////////////////

export interface $ZodAnyDef extends core.$ZodTypeDef {
  type: "any";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodAny extends core.$ZodType<any, any, $ZodAnyDef> {}

export const $ZodAny: core.$constructor<$ZodAny, $ZodAnyDef> = core.$constructor("$ZodAny", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input) => input;
});

/////////////////////////////////////////

export interface $ZodUnknownDef extends core.$ZodTypeDef {
  type: "unknown";
  error?: err.$ZodErrorMap<never> | undefined;
}

export interface $ZodUnknown extends core.$ZodType<unknown, unknown, $ZodUnknownDef> {}

export const $ZodUnknown: core.$constructor<$ZodUnknown, $ZodUnknownDef> = core.$constructor(
  "$ZodUnknown",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input) => input;
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNever      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodNeverDef extends core.$ZodTypeDef {
  type: "never";
  error?: err.$ZodErrorMap<err.$ZodIssue> | undefined;
}

export interface $ZodNever extends core.$ZodType<never, never, $ZodNeverDef> {}
export const $ZodNever: core.$constructor<$ZodNever, $ZodNeverDef> = core.$constructor("$ZodNever", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    return core.$ZodFailure.from(
      [{ origin: "never", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodVoid      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export interface $ZodVoidDef extends core.$ZodTypeDef {
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodVoid extends core.$ZodType<void, void, $ZodVoidDef> {}

export const $ZodVoid: core.$constructor<$ZodVoid, $ZodVoidDef> = core.$constructor("$ZodVoid", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (typeof input === "undefined") return undefined;
    return core.$ZodFailure.from(
      [{ origin: "void", code: "invalid_type", received: parse.t(input), level: "abort", input }],
      ctx,
      inst
    );
  };
});

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      $ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodDateDef extends core.$ZodTypeDef {
  type: "date";
  coerce: boolean;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType | err.$ZodIssueDateInvalidDate> | undefined;
}

export interface $ZodDate extends core.$ZodType<Date, unknown, $ZodDateDef> {}

export const $ZodDate: core.$constructor<$ZodDate, $ZodDateDef> = core.$constructor("$ZodDate", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
    if (inst.coerce) {
      try {
        input = new Date(input as string | number | Date);
      } catch (_err: any) {}
    }

    if (!(input instanceof Date)) {
      return core.$ZodFailure.from(
        [{ origin: "date", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    }

    if (Number.isNaN(input.getTime())) {
      return core.$ZodFailure.from([{ origin: "date", code: "invalid_date", input }], ctx, inst);
    }

    return new Date(input.getTime());
  };
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodArray      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodArrayDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "array";
  items: T;
}

export interface $ZodArray<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"][], T["_input"][], $ZodArrayDef<T>> {}

export const $ZodArray: core.$constructor<$ZodArray, $ZodArrayDef> = core.$constructor("$ZodArray", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (!Array.isArray(input)) {
      return core.$ZodFailure.from(
        [{ origin: "array", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    }

    let fail!: core.$ZodFailure;
    let hasPromises = false;
    const parseResults = Array(input.length);
    for (const [i, item] of Object.entries(input) as [number, any]) {
      const result = inst.items._parse(item, ctx);
      parseResults[i] = result;
      if (result instanceof Promise) {
        hasPromises = true;
        break;
      }
      if (core.failed(result)) {
        fail = fail ? fail.mergeIn(result) : result;
      }
    }

    if (!hasPromises) {
      if (!fail) return parseResults as any;
      return fail;
    }

    return Promise.all(parseResults).then((results) => {
      for (const [i, result] of Object.entries(results)) {
        if (core.failed(result)) {
          fail = fail ? fail.mergeIn(result, i) : result;
        }
      }
      return fail ?? results;
    });
  };
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodObject      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
interface $ZodRawShape {
  [k: string]: core.$ZodType;
}

export type ObjectOutputType<Shape extends $ZodRawShape> = types.addQuestionMarks<{
  [k in keyof Shape]: Shape[k]["_output"];
}>;

export type ObjectInputType<Shape extends $ZodRawShape> = types.addQuestionMarks<{
  [k in keyof Shape]: Shape[k]["_input"];
}>;

// type shapeToEntries<T extends $ZodRawShape> =
export interface $ZodObjectDef<Shape extends $ZodRawShape = $ZodRawShape> extends core.$ZodTypeDef {
  type: "object";
  properties: Shape;
  additionalProperties?: core.$ZodType;
}

interface $ZodObject<Shape extends $ZodRawShape = $ZodRawShape>
  extends core.$ZodType<ObjectOutputType<Shape>, ObjectInputType<Shape>, $ZodObjectDef<Shape>> {}

function handleObjectResults(results: Record<PropertyKey, core.$SyncParseResult>, fail?: core.$ZodFailure) {
  for (const key in results) {
    if (core.failed(results[key])) {
      fail = fail || new core.$ZodFailure();
      fail.mergeIn(results[key], key);
    }
  }
  return fail ?? results;
}

export const $ZodObject: core.$constructor<$ZodObject, $ZodObjectDef> = core.$constructor("$ZodObject", (inst, def) => {
  core.$ZodType.init(inst, def);
  const _shapeKeys = new Set(Object.keys(inst.properties));
  const _optionalKeys = new Set(
    Object.entries(inst.properties).map(([_, v]) => {
      return (v as any)["~optional"];
    })
  );
  const _shapeEntries = Object.entries(inst.properties);

  inst._typecheck = (input: unknown, ctx) => {
    if (!parse.isPlainObject(input)) {
      return core.$ZodFailure.from(
        [{ origin: "object", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    }

    let async!: true;
    let fail!: core.$ZodFailure;
    const objectResults: any = {}; // in coerce mode, reuse `input` instead of {}
    let unrecognizedKeys!: Set<string>;

    // iterate over shape keys
    for (const [key, value] of _shapeEntries) {
      // do not add omitted optional keys
      if (!(key in input) && _optionalKeys.has(key)) {
        console.log(`skipping optional prop ${key}`);
        continue;
      }

      const result = value._parse((input as any)[key], ctx);
      objectResults[key] = result;
      if (result instanceof Promise) async = true;
    }

    // iterate over input keys
    for (const key in input) {
      if (_shapeKeys.has(key)) continue;
      if (inst.additionalProperties) {
        objectResults[key] = inst.additionalProperties._parse((input as any)[key]);
        if (objectResults[key] instanceof Promise) async = true;
      } else {
        unrecognizedKeys = unrecognizedKeys ?? new Set();
        unrecognizedKeys.add(key);
      }
    }

    if (unrecognizedKeys) {
      fail = core.$ZodFailure.from(
        [{ origin: "object", code: "unrecognized_keys", keys: [...unrecognizedKeys], input: input }],
        ctx,
        inst
      );
    }
    if (!async) return handleObjectResults(objectResults, fail) as object;
    return util.promiseAllObject(objectResults).then((results) => handleObjectResults(results, fail)) as any;
  };
});

/////////////////////////////////////////
/////////////////////////////////////////
//////////                    ///////////
//////////      $ZodUnion      //////////
//////////                    ///////////
/////////////////////////////////////////
/////////////////////////////////////////
export interface $ZodUnionDef<T extends core.$ZodType[] = core.$ZodType[]> extends core.$ZodTypeDef {
  elements: T;
}

export interface $ZodUnion<T extends core.$ZodType[] = core.$ZodType[]>
  extends core.$ZodType<T[number]["_output"], T[number]["_input"], $ZodUnionDef<T>> {}

export const $ZodUnion: core.$constructor<$ZodUnion, $ZodUnionDef> = core.$constructor("$ZodUnion", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    let async = false;
    const results: any[] = Array(inst.elements.length);
    for (const i in inst.elements) {
      const option = inst.elements[i];
      results[i] = option._parse(input, ctx);
      if (results[i] instanceof Promise) async = true;
      if (async) continue;
      if (!core.failed(results[i])) {
        return results[i];
      }
    }

    if (!async)
      return core.$ZodFailure.from([{ origin: "union", code: "invalid_union", errors: results, input }], ctx, inst);

    return Promise.all(results).then((results) => {
      for (const result of results) {
        if (!core.failed(result)) {
          return result;
        }
      }
      return core.$ZodFailure.from([{ origin: "union", code: "invalid_union", errors: results, input }], ctx, inst);
    });
  };
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////                                  //////////
//////////      $ZodDiscriminatedUnion      //////////
//////////                                  //////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
export interface $ZodDiscriminatedUnionDef<Options extends core.$ZodType[] = core.$ZodType[]>
  extends $ZodUnionDef<Options> {}

export interface $ZodDiscriminatedUnion<Options extends core.$ZodType[] = core.$ZodType[]> extends $ZodUnion<Options> {}

function matchDiscriminators(input: any, discs: $ZodDiscriminators): boolean {
  for (const disc of discs) {
    if (disc instanceof Set) {
      if (!disc.has(input)) return false;
    } else if (disc.key !== null) {
      if (input === undefined) return false;
      return matchDiscriminators(input[disc.key], disc.discs);
    }
  }
  return true;
}

export const $ZodDiscriminatedUnion: core.$constructor<$ZodDiscriminatedUnion, $ZodDiscriminatedUnionDef> =
  core.$constructor("$ZodDiscriminatedUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    const _unionParse = inst._parse;
    const _discMap: Map<core.$ZodType, $ZodDiscriminators> = new Map();
    for (const option of inst.elements) {
      const discs = (option as any)["~discriminators"];
      if (discs) {
        _discMap.set(option, discs);
      }
    }
    inst._typecheck = (input, ctx) => {
      const filteredOptions: core.$ZodType[] = [];
      for (const option of inst.elements) {
        if (_discMap.has(option)) {
          if (matchDiscriminators(input, _discMap.get(option)!)) {
            filteredOptions.push(option);
          }
        } else {
          filteredOptions.push(option);
        }
      }

      if (filteredOptions.length === 1) return filteredOptions[0]._parse(input, ctx) as any;

      return _unionParse(input, ctx);
    };
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodIntersection      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
function mergeValues(
  a: any,
  b: any
): { valid: true; data: any } | { valid: false; mergeErrorPath: (string | number)[] } {
  const aType = parse.t(a);
  const bType = parse.t(b);

  if (a === b) {
    return { valid: true, data: a };
  }
  if (aType === parse.ZodParsedType.object && bType === parse.ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);

    const newObj: any = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        };
      }
      newObj[key] = sharedValue.data;
    }

    return { valid: true, data: newObj };
  }
  if (aType === parse.ZodParsedType.array && bType === parse.ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }

    const newArray: unknown[] = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);

      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        };
      }

      newArray.push(sharedValue.data);
    }

    return { valid: true, data: newArray };
  }
  if (aType === parse.ZodParsedType.date && bType === parse.ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  }
  return { valid: false, mergeErrorPath: [] };
}

export interface $ZodIntersectionDef<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends core.$ZodTypeDef {
  type: "intersection";
  left: A;
  right: B;
}

export interface $ZodIntersection<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<A["_output"] & B["_output"], core.input<A> & core.input<B>, $ZodIntersectionDef<A, B>> {}

function handleIntersectionResults(results: [core.$SyncParseResult, core.$SyncParseResult]): core.$SyncParseResult {
  const [parsedLeft, parsedRight] = results;
  let fail!: core.$ZodFailure;
  if (core.failed(parsedLeft)) {
    fail = parsedLeft;
  }

  if (core.failed(parsedRight)) {
    fail = fail ? fail.mergeIn(parsedRight) : parsedRight;
  }

  if (fail) return fail;

  const merged = mergeValues(parsedLeft, parsedRight);
  if (!merged.valid) {
    throw new Error(
      `Unmergable intersection types at ${merged.mergeErrorPath.join(".")}: ${parse.t(parsedLeft)} and ${parse.t(parsedRight)}`
    );
  }

  return merged.data;
}

export const $ZodIntersection: core.$constructor<$ZodIntersection, $ZodIntersectionDef> = core.$constructor(
  "$ZodIntersection",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      const resultLeft = inst.left._parse(input, ctx);
      const resultRight = inst.right._parse(input, ctx);
      const async = resultLeft instanceof Promise || resultRight instanceof Promise;
      return async
        ? Promise.all([resultLeft, resultRight]).then(handleIntersectionResults)
        : handleIntersectionResults([resultLeft, resultRight]);
    };
  }
);

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodTuple      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export interface $ZodTupleDef<
  Items extends core.$ZodType[] = core.$ZodType[],
  Rest extends core.$ZodType | null = core.$ZodType | null,
> extends core.$ZodTypeDef {
  prefixItems: Items;
  items: Rest;
}

type ZodTupleItems = core.$ZodType[];
type TupleOutputType<T extends ZodTupleItems, Rest extends core.$ZodType | null> = [
  ...{
    [k in keyof T]: T[k]["_output"];
  },
  ...(Rest extends core.$ZodType ? Rest["_output"][] : []),
];
type TupleInputType<T extends ZodTupleItems, Rest extends core.$ZodType | null> = [
  ...{
    [k in keyof T]: T[k]["_input"];
  },
  ...(Rest extends core.$ZodType ? Rest["_input"][] : []),
];

function handleTupleResults<T>(results: T): core.$SyncParseResult<T> {
  let fail!: core.$ZodFailure;
  for (const i in results) {
    const result = results[i];
    if (core.failed(result)) {
      fail = fail || new core.$ZodFailure();
      fail.mergeIn(result, i);
    }
  }
  return fail ?? results;
}

export interface $ZodTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends core.$ZodType | null = core.$ZodType | null,
> extends core.$ZodType<TupleOutputType<T, Rest>, TupleInputType<T, Rest>, $ZodTupleDef<T, Rest>> {}

export const $ZodTuple: core.$constructor<$ZodTuple, $ZodTupleDef> = core.$constructor("$ZodTuple", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (!Array.isArray(input)) {
      return core.$ZodFailure.from(
        [{ input, origin: "tuple", code: "invalid_type", level: "abort", received: parse.t(input) }],
        ctx,
        inst
      );
    }

    if (!inst.items && input.length !== inst.prefixItems.length) {
      const tooBig = input.length !== inst.prefixItems.length;
      return core.$ZodFailure.from(
        [
          {
            input,
            origin: "array",
            ...(tooBig
              ? { code: "too_big", max_size: inst.prefixItems.length }
              : { code: "too_small", min_size: inst.prefixItems.length }),
          },
        ],
        ctx,
        inst
      );
    }

    let async = false;

    const results: any[] = Array(input.length);
    for (const i in inst.prefixItems) {
      const prefixItem = inst.prefixItems[i];
      results[i] = prefixItem._parse(input[i], ctx);
      if (results[i] instanceof Promise) async = true;
    }
    if (inst.items) {
      const rest = input.slice(inst.prefixItems.length);
      for (const el of rest) {
        const result = inst.items._parse(el, ctx);
        results.push(result);
        if (result instanceof Promise) async = true;
      }
    }

    if (!async) return handleTupleResults(results);
    return Promise.all(results).then(handleTupleResults);
  };
});

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodRecord      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

interface $HasValues extends core.$ZodType<PropertyKey, PropertyKey> {
  "~values": Set<PropertyKey>;
}

interface $HasPattern extends core.$ZodType<PropertyKey, PropertyKey> {
  _pattern: RegExp;
}

type $ZodRecordKey = $HasValues | $HasPattern;
interface $ZodRecordDef<K extends $ZodRecordKey = $ZodRecordKey, V extends core.$ZodType = core.$ZodType>
  extends $ZodObjectDef<Record<core.input<K>, V>> {
  keySchema: K;
  valueSchema: V;
}
// export type KeySchema = $HasValues | $HasPattern;
export type RecordType<K extends string | number | symbol, V> = [string] extends [K]
  ? Record<K, V>
  : [number] extends [K]
    ? Record<K, V>
    : [symbol] extends [K]
      ? Record<K, V>
      : [core.BRAND<string | number | symbol>] extends [K]
        ? Record<K, V>
        : Partial<Record<K, V>>;

export interface $ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<
    RecordType<core.output<Key>, core.output<Value>>,
    RecordType<core.input<Key>, core.input<Value>>,
    $ZodRecordDef<Key, Value>
  > {}

export const $ZodRecord: core.$constructor<$ZodRecord, $ZodRecordDef> = core.$constructor("$ZodRecord", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input: any, ctx) => {
    const objectResults: any = {};
    let fail!: core.$ZodFailure;
    let async!: boolean;
    if (!parse.isPlainObject(input)) {
      return core.$ZodFailure.from(
        [{ origin: "record", code: "invalid_type", level: "abort", received: parse.t(input), input }],
        ctx,
        inst
      );
    }

    if ("~values" in inst.keySchema) {
      const values = inst.keySchema["~values"];
      for (const key of values) {
        const valueResult = inst.valueSchema._parse(input[key], ctx);
        if (valueResult instanceof Promise) async = true;
        objectResults[key] = valueResult;
      }
    } else {
      for (const key in input) {
        const keyResult = inst.keySchema._parse(key, ctx);
        if (keyResult instanceof Promise)
          throw new Error(
            "Async schemas not supported in object keys currently. Open an issue if you need this feature."
          );
        if (core.failed(keyResult)) {
          fail = fail ?? new core.$ZodFailure();
          fail.addIssue({ origin: "record", code: "invalid_key", issues: keyResult.issues, input: key, path: [key] });
          fail.mergeIn(keyResult, key);
          continue;
        }
        objectResults[keyResult] = inst.valueSchema._parse(input[key], ctx);
        if (objectResults[key] instanceof Promise) async = true;
      }
    }

    if (!async) return handleObjectResults(objectResults, fail) as object;
    return util.promiseAllObject(objectResults).then((results) => handleObjectResults(results, fail)) as any;
  };
});

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      $ZodMap      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////
export interface $ZodMapDef<Key extends core.$ZodType = core.$ZodType, Value extends core.$ZodType = core.$ZodType>
  extends core.$ZodTypeDef {
  keyType: Key;
  valueType: Value;
}

export interface $ZodMap<Key extends core.$ZodType = core.$ZodType, Value extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<
    Map<core.output<Key>, core.output<Value>>,
    Map<core.input<Key>, core.input<Value>>,
    $ZodMapDef<Key, Value>
  > {}

const PropertyKeyTypes = new Set(["string", "number", "symbol"]);
function handleMapResults(
  results: [core.$SyncParseResult, core.$SyncParseResult, unknown][],
  input: Map<any, any>
): core.$SyncParseResult<Map<any, any>> {
  let fail!: core.$ZodFailure;
  const parsedMap = new Map();
  for (const [keyResult, valueResult, originalKey] of results) {
    if (core.failed(keyResult)) {
      fail = fail || new core.$ZodFailure();
      if (PropertyKeyTypes.has(typeof originalKey)) fail.mergeIn(keyResult, originalKey as PropertyKey);
      else fail.addIssue({ origin: "map", code: "invalid_key", input, issues: fail.issues });
    } else if (core.failed(valueResult)) {
      fail = fail || new core.$ZodFailure();
      fail.addIssue({ origin: "map", code: "invalid_value", input, key: keyResult, issues: fail.issues });
    } else {
      parsedMap.set(keyResult, valueResult);
    }
  }
  return fail ?? parsedMap;
}

export const $ZodMap: core.$constructor<$ZodMap, $ZodMapDef> = core.$constructor("$ZodMap", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (!(input instanceof Map)) {
      return core.$ZodFailure.from(
        [{ input, origin: "map", code: "invalid_type", received: parse.t(input) }],
        ctx,
        inst
      );
    }

    let async = false;
    const mapResults: [any, any, any][] = [];

    for (const [key, value] of Object.entries(input)) {
      const keyResult = inst.keyType._parse(key, ctx);
      const valueResult = inst.valueType._parse(value, ctx);
      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        mapResults.push(Promise.all([keyResult, valueResult, key]) as any);
        async = true;
      } else mapResults.push([keyResult, valueResult, key]);
    }

    if (async) return Promise.all(mapResults).then((mapResults) => handleMapResults(mapResults, input));
    return handleMapResults(mapResults, input);
  };
});

export interface $ZodSetDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "set";
  valueType: T;
}

export interface $ZodSet<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<Set<T["_output"]>, Set<T["_input"]>, $ZodSetDef<T>> {}

function handleSetResults(setResults: core.$SyncParseResult<any>[]) {
  const parsedSet = new Set();
  let fail!: core.$ZodFailure;
  for (const result of setResults) {
    if (core.failed(result)) {
      fail = fail || new core.$ZodFailure();
      fail.mergeIn(result);
    } else {
      parsedSet.add(result);
    }
  }
  return fail ?? parsedSet;
}

export const $ZodSet: core.$constructor<$ZodSet, $ZodSetDef> = core.$constructor("$ZodSet", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (!(input instanceof Set)) {
      return core.$ZodFailure.from(
        [{ input, origin: "set", code: "invalid_type", level: "abort", received: parse.t(input) }],
        ctx,
        inst
      );
    }

    const setResults: any[] = Array(input.size);
    let async!: boolean;
    let index = 0;
    for (const item of input) {
      const result = def.valueType._parse(item, ctx);
      if (result instanceof Promise) {
        async = true;
      }
      setResults[index++] = result;
    }

    if (async) return Promise.all(setResults).then(handleSetResults);
    return handleSetResults(setResults);
  };
});

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodEnum      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

export type EnumLike = Record<string | number, types.Primitive>;
export type PrimitiveArray = Array<types.Primitive>;
export type EnumValues = EnumLike | PrimitiveArray;
export type IsString<T> = T extends string ? T : never;
export type Values<T extends EnumValues> = T extends EnumLike
  ? T
  : T extends PrimitiveArray
    ? {
        [k in IsString<T[number]>]: k;
      }
    : { [k in keyof T]: T[k] };

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}
type arg0 = Values<typeof Color>;
type arg1 = Values<{ a: "a"; b: "b" }>;
type arg2 = Values<["a", "b"]>;
type arg3 = Values<["a", "b", true, 5, 10n]>;
type arg4 = Values<Array<"a" | "b" | 123 | false>>;
type arg5 = Values<{ a: "a"; b: "b"; c: 1234n; d: true }>;
type arg6 = Values<number[]>;

export interface $ZodEnumDef extends core.$ZodTypeDef {
  type: "enum";
  values: Array<{ key?: string; value: types.Primitive }>;
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodEnum<T extends EnumValues = EnumValues> extends core.$ZodType<T, T, $ZodEnumDef> {
  enum: Values<T>;
}

export const $ZodEnum: core.$constructor<$ZodEnum<any>, $ZodEnumDef> = core.$constructor("$ZodEnum", (inst, def) => {
  core.$ZodType.init(inst, def);

  const allowable: types.Primitive[] = Object.entries(def.values).map(([_, v]) => v.value);
  const allowableSet = new Set(allowable);

  const _enum = {} as any;
  for (const [key, value] of Object.entries(def.values)) {
    if (key) _enum[key] = value.value;
    if (typeof value === "string") _enum[value] = value;
    if (typeof value === "number") _enum[value] = value;
  }
  inst.enum = _enum;
  inst._typecheck = (input, ctx) => {
    if (allowableSet.has(input as any)) {
      return input;
    }
    return core.$ZodFailure.from(
      [{ origin: "enum", code: "invalid_type", received: parse.t(input), allowable, input }],
      ctx,
      inst
    );
  };
});

/////////////////////////////////////   $ZodLiteral   /////////////////////////////////////
export interface $ZodLiteral<T extends types.Primitive[] = types.Primitive[]> extends $ZodEnum<T> {}
export const $ZodLiteral: core.$constructor<$ZodLiteral<any>, $ZodEnumDef> = core.$constructor(
  "$ZodLiteral",
  (inst, def) => {
    $ZodEnum.init(inst, def);
  }
);

/////////////////////////////////////   $ZodNativeEnum   /////////////////////////////////////
export interface $ZodNativeEnum<T extends EnumLike = EnumLike> extends $ZodEnum<T> {}
export const $ZodNativeEnum: core.$constructor<$ZodNativeEnum<any>, $ZodEnumDef> = core.$constructor(
  "$ZodNativeEnum",
  (inst, def) => {
    $ZodEnum.init(inst, def);
  }
);

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodFile        //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export interface $ZodFileDef extends core.$ZodTypeDef {
  type: "file";
  error?: err.$ZodErrorMap<err.$ZodIssueInvalidType> | undefined;
}

export interface $ZodFile extends core.$ZodType<File, File, $ZodFileDef> {}

export const $ZodFile: core.$constructor<$ZodFile, $ZodFileDef> = core.$constructor("$ZodFile", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (input instanceof File) return input;
    return core.$ZodFailure.from(
      [{ origin: "file", code: "invalid_type", level: "abort", received: parse.t(input), input }],
      ctx,
      inst
    );
  };
});

////////////////////////////////////////////////
////////////////////////////////////////////////
//////////                            //////////
//////////        $ZodTransform       //////////
//////////                            //////////
////////////////////////////////////////////////
////////////////////////////////////////////////
export interface $ZodTransformDef<Out = unknown, T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "transform";
  effect: (arg: T["_output"]) => Out;
  schema: T;
}
export interface $ZodTransform<Out = unknown, T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<Out, T["_input"], $ZodTransformDef<T>> {}
export const $ZodTransform: core.$constructor<$ZodTransform<any>, $ZodTransformDef> = core.$constructor(
  "$ZodTransform",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      const result = inst.schema._parse(input, ctx);
      if (result instanceof Promise) return result.then((result) => inst.effect(result));
      return inst.effect(result);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodOptional      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodOptionalDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "optional";
  innerType: T;
}

export interface $ZodOptional<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"] | undefined, T["_input"] | undefined, $ZodOptionalDef<T>> {}

export const $ZodOptional: core.$constructor<$ZodOptional, $ZodOptionalDef> = core.$constructor(
  "$ZodOptional",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      if (input === undefined) return undefined;
      return def.innerType._parse(input, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodNullable      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNullableDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "nullable";
  innerType: T;
}

export interface $ZodNullable<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"] | null, T["_input"] | null, $ZodNullableDef<T>> {}

export const $ZodNullable: core.$constructor<$ZodNullable, $ZodNullableDef> = core.$constructor(
  "$ZodNullable",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      if (input === null) return null;
      return def.innerType._parse(input, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodDefault       //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodDefaultDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "default";
  innerType: T;
  defaultValue: () => core.input<T>;
}

export interface $ZodDefault<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<types.noUndefined<T["_output"]>, core.input<T> | undefined, $ZodDefaultDef<T>> {}

export const $ZodDefault: core.$constructor<$ZodDefault, $ZodDefaultDef> = core.$constructor(
  "$ZodDefault",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      if (input === undefined) {
        input = def.defaultValue();
      }
      if (input instanceof Promise) return input.then((input) => def.innerType._parse(input, ctx));
      return def.innerType._parse(input, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////       $ZodCatch        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodCatchDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "catch";
  innerType: T;
  catchValue: (ctx: { error: core.$ZodFailure; input: unknown }) => core.input<T>;
}

export interface $ZodCatch<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<T["_output"], unknown, $ZodCatchDef<T>> {}

export const $ZodCatch: core.$constructor<$ZodCatch, $ZodCatchDef> = core.$constructor("$ZodCatch", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    const result = def.innerType._parse(input, ctx);
    if (result instanceof Promise) {
      return result.then((res) => {
        return core.failed(res) ? def.catchValue({ error: res, input }) : res;
      });
    }
    return core.failed(result) ? def.catchValue({ error: result, input }) : result;
  };
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////        $ZodNaN         //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodNaNDef extends core.$ZodTypeDef {
  type: "nan";
}

export interface $ZodNaN extends core.$ZodType<number, number, $ZodNaNDef> {}

export const $ZodNaN: core.$constructor<$ZodNaN, $ZodNaNDef> = core.$constructor("$ZodNaN", (inst, def) => {
  core.$ZodType.init(inst, def);
  inst._typecheck = (input, ctx) => {
    if (typeof input !== "number" || !Number.isNaN(input)) {
      return core.$ZodFailure.from(
        [{ input, origin: "nan", code: "invalid_type", received: parse.t(input) }],
        ctx,
        inst
      );
    }
    return input;
  };
});

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodPipeline      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface $ZodPipelineDef<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends core.$ZodTypeDef {
  type: "pipeline";
  in: A;
  out: B;
}

export interface $ZodPipeline<A extends core.$ZodType = core.$ZodType, B extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<B["_output"], core.input<A>, $ZodPipelineDef<A, B>> {}

export const $ZodPipeline: core.$constructor<$ZodPipeline, $ZodPipelineDef> = core.$constructor(
  "$ZodPipeline",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      const result = def.in._parse(input, ctx);
      if (result instanceof Promise) {
        return result.then((res) => {
          if (core.failed(res)) {
            return res;
          }
          return def.out._parse(res, ctx);
        });
      }
      if (core.failed(result)) {
        return result;
      }
      return def.out._parse(result, ctx);
    };
  }
);

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      $ZodReadonly      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;

type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? ReadonlyArray<V>
        : T extends BuiltIn
          ? T
          : Readonly<T>;

function handleReadonlyResult(result: core.$SyncParseResult): Readonly<core.$SyncParseResult> {
  if (core.failed(result)) return result;
  return Object.freeze(result);
}
export interface $ZodReadonlyDef<T extends core.$ZodType = core.$ZodType> extends core.$ZodTypeDef {
  type: "readonly";
  innerType: T;
}

export interface $ZodReadonly<T extends core.$ZodType = core.$ZodType>
  extends core.$ZodType<MakeReadonly<T["_output"]>, MakeReadonly<core.input<T>>, $ZodReadonlyDef<T>> {}

export const $ZodReadonly: core.$constructor<$ZodReadonly, $ZodReadonlyDef> = core.$constructor(
  "$ZodReadonly",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    inst._typecheck = (input, ctx) => {
      const result = def.innerType._parse(input, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
    };
  }
);

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   $ZodTemplateLiteral   //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// any schema that resolves to a literal or a regex can be used
// type TemplateLiteralPart = string | number | boolean | null | undefined | bigint | core.$ZodType<string | number, any>;
interface $ZodTemplateLiteralDef extends core.$ZodTypeDef {
  type: "template_literal";
  parts: TemplateLiteralPart[];
}
interface $ZodTemplateLiteral<Template extends string>
  extends core.$ZodType<Template, Template, $ZodTemplateLiteralDef> {
  _pattern: RegExp;
}

type LiteralPart = string | number | boolean | null | undefined;
interface SchemaPart extends core.$ZodType<TemplateLiteralPart, TemplateLiteralPart> {
  _pattern: string | RegExp;
}
type TemplateLiteralPart = LiteralPart | SchemaPart;

type appendToTemplateLiteral<
  Template extends string,
  Suffix extends LiteralPart | core.$ZodType,
> = Suffix extends LiteralPart
  ? `${Template}${Suffix}`
  : Suffix extends core.$ZodType<infer Output extends LiteralPart>
    ? `${Template}${Output}`
    : never;

type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> = [] extends Parts
  ? ``
  : Parts extends [...infer Rest extends TemplateLiteralPart[], infer Last extends TemplateLiteralPart]
    ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
    : never;

const $ZodTemplateLiteral: core.$constructor<$ZodTemplateLiteral<any>, $ZodTemplateLiteralDef> = core.$constructor(
  "$ZodTemplateLiteral",
  (inst, def) => {
    core.$ZodType.init(inst, def);
    const regexParts: string[] = [];
    for (const part of def.parts) {
      if (part instanceof core.$ZodType) {
        const source = part._pattern instanceof RegExp ? part._pattern.source : part._pattern;
        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else {
        regexParts.push(`${part}`);
      }
    }
    inst._pattern = new RegExp(`^${regexParts.join(".*")}$`);

    inst._typecheck = (input, ctx) => {
      if (typeof input !== "string") {
        return core.$ZodFailure.from(
          [{ input, origin: "template_literal", code: "invalid_type", received: parse.t(input) }],
          ctx,
          inst
        );
      }

      if (!inst._pattern.test(input)) {
        return core.$ZodFailure.from(
          [{ input, origin: "template_literal", code: "invalid_type", received: parse.t(input) }],
          ctx,
          inst
        );
      }

      return input;
    };
  }
);

function templateLiteral<const Parts extends TemplateLiteralPart[]>(
  parts: Parts
): $ZodTemplateLiteral<partsToTemplateLiteral<Parts>> {
  return new $ZodTemplateLiteral({
    type: "template_literal",
    parts,
  }) as any;
}
const l = templateLiteral([
  "Hello, ",
  new $ZodString({
    type: "string",
    checks: [],
    coerce: false,
  }),
  "!",
  123,
  true,
]);
// // type appendToTemplateLiteral<
// //   Template extends string,
// //   Suffix extends TemplateLiteralPrimitive | core.$ZodType,
// // > = Suffix extends TemplateLiteralPrimitive
// //   ? `${Template}${Suffix}`
// //   : Suffix extends $ZodOptional<infer UnderlyingType>
// //     ? Template | appendToTemplateLiteral<Template, UnderlyingType>
// //     : Suffix extends $ZodBranded<infer UnderlyingType, any>
// //       ? appendToTemplateLiteral<Template, UnderlyingType>
// //       : Suffix extends core.$ZodType<infer Output, any>
// //         ? Output extends TemplateLiteralPrimitive | bigint
// //           ? `${Template}${Output}`
// //           : never
// //         : never;

// // type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
// //   [] extends Parts
// //     ? ``
// //     : Parts extends [
// //           ...infer Rest extends TemplateLiteralPart[],
// //           infer Last extends TemplateLiteralPart,
// //         ]
// //       ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
// //       : never;

// // export class ZodCoreTemplateLiteral<
// //   Template extends string = "",
// // > extends ZodCoreType<Template, Template> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral;
// //   coerce: boolean;
// //   parts: readonly TemplateLiteralPart[];
// //   regexString: string;
// //   constructor(_def: core.$Def<$ZodTemplateLiteral>) {
// //     super(_def);
// //   }
// //   interpolated<I extends TemplateLiteralInterpolatedPosition>(
// //     type: Exclude<
// //       I,
// //       $ZodNever | $ZodNaN | $ZodPipeline<any, any> | $ZodLazy<any>
// //     >
// //   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
// //     // TODO: check for invalid types at runtime
// //     return this._addPart(type) as any;
// //   }

// //   literal<L extends TemplateLiteralPrimitive>(
// //     literal: L
// //   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
// //     return this._addPart(literal) as any;
// //   }

// //   "_parse"(
// //     input: unknown,
// //     _ctx: parse.ParseContext
// //   ): parse.ParseReturnType<Template> {
// //     if (this.def.coerce) {
// //       input = String(input);
// //     }

// //     const parsedType = parse.t(input);

// //     if (parsedType !== parse.ZodParsedType.string) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.string,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     if (!new RegExp(this.regexString).test(input)) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.custom,
// //           message: `String does not match template literal`,
// //         },
// //       ]);
// //     }

// //     return input;
// //   }

// //   protected _addParts(parts: TemplateLiteralPart[]): $ZodTemplateLiteral {
// //     let r = this.regexString;
// //     for (const part of parts) {
// //       r = this._appendToRegexString(r, part);
// //     }
// //     return new $ZodTemplateLiteral({
// //       ...this,
// //       parts: [...this.parts, ...parts],
// //       regexString: r,
// //     });
// //   }

// //   protected _addPart(
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): $ZodTemplateLiteral {
// //     const parts = [...this.parts, part];

// //     return new $ZodTemplateLiteral({
// //       ...this,
// //       parts,
// //       regexString: this._appendToRegexString(this.regexString, part),
// //     });
// //   }

// //   protected _appendToRegexString(
// //     regexString: string,
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): string {
// //     return `^${this._unwrapRegExp(
// //       regexString
// //     )}${this._transformPartToRegexString(part)}$`;
// //   }

// //   protected _transformPartToRegexString(
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): string {
// //     if (!(part instanceof core.$ZodType)) {
// //       return this._escapeRegExp(part);
// //     }

// //     if (part instanceof $ZodLiteral) {
// //       return this._escapeRegExp(part._def.value);
// //     }

// //     if (part instanceof $ZodString) {
// //       return this._transformZodStringPartToRegexString(part);
// //     }

// //     if (part instanceof $ZodEnum || part instanceof $ZodNativeEnum) {
// //       const values =
// //         part instanceof $ZodEnum
// //           ? part._def.values
// //           : util.getValidEnumValues(part._def.values);

// //       return `(${values.map(this._escapeRegExp).join("|")})`;
// //     }

// //     if (part instanceof $ZodUnion) {
// //       return `(${(part._def.options as any[])
// //         .map((option) => this._transformPartToRegexString(option))
// //         .join("|")})`;
// //     }

// //     if (part instanceof $ZodNumber) {
// //       return this._transformZodNumberPartToRegexString(part);
// //     }

// //     if (part instanceof $ZodOptional) {
// //       return `(${this._transformPartToRegexString(part.unwrap())})?`;
// //     }

// //     if (part instanceof $ZodTemplateLiteral) {
// //       return this._unwrapRegExp(part._def.regexString);
// //     }

// //     if (part instanceof $ZodBigInt) {
// //       // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
// //       return "\\-?\\d+";
// //     }

// //     if (part instanceof $ZodBoolean) {
// //       return "(true|false)";
// //     }

// //     if (part instanceof $ZodNullable) {
// //       do {
// //         part = part.unwrap();
// //       } while (part instanceof $ZodNullable);

// //       return `(${this._transformPartToRegexString(part)}|null)${
// //         part instanceof $ZodOptional ? "?" : ""
// //       }`;
// //     }

// //     if (part instanceof $ZodBranded) {
// //       return this._transformPartToRegexString(part.unwrap());
// //     }

// //     if (part instanceof $ZodAny) {
// //       return ".*";
// //     }

// //     if (part instanceof $ZodNull) {
// //       return "null";
// //     }

// //     if (part instanceof $ZodUndefined) {
// //       return "undefined";
// //     }

// //     throw new err.ZodTemplateLiteralUnsupportedTypeError();
// //   }

// //   // FIXME: we don't support transformations, so `.trim()` is not supported.
// //   protected _transformZodStringPartToRegexString(part: $ZodString): string {
// //     let maxLength = Number.POSITIVE_INFINITY;
// //     let minLength = 0;
// //     let endsWith = "";
// //     let startsWith = "";

// //     for (const ch of part._def.checks) {
// //       const regex = this._resolveRegexForStringCheck(ch);

// //       if (regex) {
// //         return this._unwrapRegExp(regex);
// //       }

// //       if (ch.kind === "endsWith") {
// //         endsWith = ch.value;
// //       } else if (ch.kind === "length") {
// //         minLength = maxLength = ch.value;
// //       } else if (ch.kind === "max") {
// //         maxLength = Math.max(0, Math.min(maxLength, ch.value));
// //       } else if (ch.kind === "min") {
// //         minLength = Math.max(minLength, ch.value);
// //       } else if (ch.kind === "startsWith") {
// //         startsWith = ch.value;
// //       } else {
// //         throw new err.ZodTemplateLiteralUnsupportedCheckError(
// //           $ZodFirstPartyTypeKind.ZodString,
// //           ch.kind
// //         );
// //       }
// //     }

// //     const constrainedMinLength = Math.max(
// //       0,
// //       minLength - startsWith.length - endsWith.length
// //     );
// //     const constrainedMaxLength = Number.isFinite(maxLength)
// //       ? Math.max(0, maxLength - startsWith.length - endsWith.length)
// //       : Number.POSITIVE_INFINITY;

// //     if (
// //       constrainedMaxLength === 0 ||
// //       constrainedMinLength > constrainedMaxLength
// //     ) {
// //       return `${startsWith}${endsWith}`;
// //     }

// //     return `${startsWith}.${this._resolveRegexWildcardLength(
// //       constrainedMinLength,
// //       constrainedMaxLength
// //     )}${endsWith}`;
// //   }

// //   protected _resolveRegexForStringCheck(check: $ZodStringCheck): RegExp | null {
// //     return {
// //       [check.kind]: null,
// //       cuid: cuidRegex,
// //       cuid2: cuid2Regex,
// //       datetime: check.kind === "datetime" ? datetimeRegex(check) : null,
// //       email: emailRegex,
// //       ip:
// //         check.kind === "ip"
// //           ? {
// //               any: new RegExp(
// //                 `^(${this._unwrapRegExp(
// //                   ipv4Regex.source
// //                 )})|(${this._unwrapRegExp(ipv6Regex.source)})$`
// //               ),
// //               v4: ipv4Regex,
// //               v6: ipv6Regex,
// //             }[check.version || "any"]
// //           : null,
// //       regex: check.kind === "regex" ? check.regex : null,
// //       ulid: ulidRegex,
// //       uuid: uuidRegex,
// //     }[check.kind];
// //   }

// //   protected _resolveRegexWildcardLength(
// //     minLength: number,
// //     maxLength: number
// //   ): string {
// //     if (minLength === maxLength) {
// //       return minLength === 1 ? "" : `{${minLength}}`;
// //     }

// //     if (maxLength !== Number.POSITIVE_INFINITY) {
// //       return `{${minLength},${maxLength}}`;
// //     }

// //     if (minLength === 0) {
// //       return "*";
// //     }

// //     if (minLength === 1) {
// //       return "+";
// //     }

// //     return `{${minLength},}`;
// //   }

// //   // FIXME: we do not support exponent notation (e.g. 2e5) since it conflicts with `.int()`.
// //   protected _transformZodNumberPartToRegexString(part: $ZodNumber): string {
// //     let canBeNegative = true;
// //     let canBePositive = true;
// //     let min = Number.NEGATIVE_INFINITY;
// //     let max = Number.POSITIVE_INFINITY;
// //     let canBeZero = true;
// //     let finite = false;
// //     let isInt = false;
// //     let acc = "";

// //     for (const ch of part._def.checks) {
// //       if (ch.kind === "finite") {
// //         finite = true;
// //       } else if (ch.kind === "int") {
// //         isInt = true;
// //       } else if (ch.kind === "max") {
// //         max = Math.min(max, ch.value);

// //         if (ch.value <= 0) {
// //           canBePositive = false;

// //           if (ch.value === 0 && !ch.inclusive) {
// //             canBeZero = false;
// //           }
// //         }
// //       } else if (ch.kind === "min") {
// //         min = Math.max(min, ch.value);

// //         if (ch.value >= 0) {
// //           canBeNegative = false;

// //           if (ch.value === 0 && !ch.inclusive) {
// //             canBeZero = false;
// //           }
// //         }
// //       } else {
// //         throw new err.ZodTemplateLiteralUnsupportedCheckError(
// //           $ZodFirstPartyTypeKind.ZodNumber,
// //           ch.kind
// //         );
// //       }
// //     }

// //     if (Number.isFinite(min) && Number.isFinite(max)) {
// //       finite = true;
// //     }

// //     if (canBeNegative) {
// //       acc = `${acc}\\-`;

// //       if (canBePositive) {
// //         acc = `${acc}?`;
// //       }
// //     } else if (!canBePositive) {
// //       return "0+";
// //     }

// //     if (!finite) {
// //       acc = `${acc}(Infinity|(`;
// //     }

// //     if (!canBeZero) {
// //       if (!isInt) {
// //         acc = `${acc}((\\d*[1-9]\\d*(\\.\\d+)?)|(\\d+\\.\\d*[1-9]\\d*))`;
// //       } else {
// //         acc = `${acc}\\d*[1-9]\\d*`;
// //       }
// //     } else if (isInt) {
// //       acc = `${acc}\\d+`;
// //     } else {
// //       acc = `${acc}\\d+(\\.\\d+)?`;
// //     }

// //     if (!finite) {
// //       acc = `${acc}))`;
// //     }

// //     return acc;
// //   }

// //   protected _unwrapRegExp(regex: RegExp | string): string {
// //     const flags = typeof regex === "string" ? "" : regex.flags;
// //     const source = typeof regex === "string" ? regex : regex.source;

// //     if (flags.includes("i")) {
// //       return this._unwrapRegExp(this._makeRegexStringCaseInsensitive(source));
// //     }

// //     return source.replace(/(^\^)|(\$$)/g, "");
// //   }

// //   protected _makeRegexStringCaseInsensitive(regexString: string): string {
// //     const isAlphabetic = (char: string) => char.match(/[a-z]/i) != null;

// //     let caseInsensitive = "";
// //     let inCharacterSet = false;
// //     for (let i = 0; i < regexString.length; i++) {
// //       const char = regexString.charAt(i);
// //       const nextChar = regexString.charAt(i + 1);

// //       if (char === "\\") {
// //         caseInsensitive += `${char}${nextChar}`;
// //         i++;
// //         continue;
// //       }

// //       if (char === "[") {
// //         inCharacterSet = true;
// //       } else if (inCharacterSet && char === "]") {
// //         inCharacterSet = false;
// //       }

// //       if (!isAlphabetic(char)) {
// //         caseInsensitive += char;
// //         continue;
// //       }

// //       if (!inCharacterSet) {
// //         caseInsensitive += `[${char.toLowerCase()}${char.toUpperCase()}]`;
// //         continue;
// //       }

// //       const charAfterNext = regexString.charAt(i + 2);

// //       if (nextChar !== "-" || !isAlphabetic(charAfterNext)) {
// //         caseInsensitive += `${char.toLowerCase()}${char.toUpperCase()}`;
// //         continue;
// //       }

// //       caseInsensitive += `${char.toLowerCase()}-${charAfterNext.toLowerCase()}${char.toUpperCase()}-${charAfterNext.toUpperCase()}`;
// //       i += 2;
// //     }

// //     return caseInsensitive;
// //   }

// //   protected _escapeRegExp(str: unknown): string {
// //     if (typeof str !== "string") {
// //       str = `${str}`;
// //     }

// //     return (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //   }

// //   static empty = (
// //     params?: RawCreateParams & { coerce?: true }
// //   ): $ZodTemplateLiteral => {
// //     return new $ZodTemplateLiteral({
// //       checks: [],
// //       ...processCreateParams(params),
// //       coerce: params?.coerce ?? false,
// //       parts: [],
// //       regexString: "^$",
// //       typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral,
// //     });
// //   };

// //   static create<
// //     Part extends TemplateLiteralPart,
// //     Parts extends [] | [Part, ...Part[]],
// //   >(
// //     parts: Parts,
// //     params?: RawCreateParams & { coerce?: true }
// //   ): $ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
// //   static create(
// //     parts: TemplateLiteralPart[],
// //     params?: RawCreateParams & { coerce?: true }
// //   ) {
// //     return $ZodTemplateLiteral.empty(params)._addParts(parts) as any;
// //   }
// // }

export type ZodFirstPartySchemaTypes =
  | $ZodString
  | $ZodNumber
  | $ZodBoolean
  | $ZodBigInt
  | $ZodSymbol
  | $ZodUndefined
  | $ZodNull
  | $ZodAny
  | $ZodUnknown
  | $ZodNever
  | $ZodVoid
  | $ZodDate
  | $ZodArray
  | $ZodObject
  | $ZodUnion
  | $ZodDiscriminatedUnion
  | $ZodIntersection
  | $ZodTuple
  | $ZodRecord
  | $ZodMap
  | $ZodSet
  | $ZodEnum
  | $ZodLiteral
  | $ZodNativeEnum
  | $ZodFile
  | $ZodTransform
  | $ZodOptional
  | $ZodNullable
  | $ZodDefault
  | $ZodCatch
  | $ZodNaN
  | $ZodPipeline
  | $ZodReadonly;
// | $ZodTemplateLiteral;
