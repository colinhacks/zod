import * as core from "zod-core";
import * as util from "zod-core/util";
import * as schemas from "./schemas.js";

//////////    ZodCoercedString    //////////

export interface ZodCoercedStringDef extends core.$ZodStringDef {}
export interface ZodCoercedString extends core.$ZodString<unknown>, schemas.ZodType<string, unknown> {
  "~def": ZodCoercedStringDef;
  "~isst": core.$ZodIssueInvalidType<"string">;
}

export const ZodCoercedString: core.$constructor<ZodCoercedString> = /*@__PURE__*/ core.$constructor(
  "ZodCoercedString",
  (inst, def) => {
    core.coerce.$ZodCoercedString.init(inst, def); // no format checks
    schemas.ZodType.init(inst, def);
    // const _super = inst._parse;
    // inst._parse = (input, ctx) => {
    //   if (def.coerce) {
    //     try {
    //       input = String(input);
    //     } catch (_) {
    //       return core.$fail(
    //         [
    //           {
    //             origin: "string",
    //             code: "invalid_type",
    //             level: "abort",
    //             input,
    //             def,
    //           },
    //         ],
    //         true
    //       );
    //     }
    //   }
    //   return _super(input, ctx);
    // };
  }
);

interface ZodStringParams extends util.TypeParams<ZodCoercedString, "coerce"> {}
const _string = util.factory(() => ZodCoercedString, {
  type: "string",
  coerce: true,
});
export function string(checks?: core.$ZodCheck<string>[]): ZodCoercedString;
export function string(params?: string | ZodStringParams, checks?: core.$ZodCheck<string>[]): ZodCoercedString;
export function string(...args: any[]): ZodCoercedString {
  return _string(...args);
}

//////////    ZodCoercedNumber    //////////
export interface ZodCoercedNumberDef extends core.$ZodNumberDef {}
export interface ZodCoercedNumber extends core.$ZodNumber<unknown>, schemas.ZodType<number, unknown> {
  "~def": ZodCoercedNumberDef;
  "~isst": core.$ZodIssueInvalidType<"number">;
}

export const ZodCoercedNumber: core.$constructor<ZodCoercedNumber> = /*@__PURE__*/ core.$constructor(
  "ZodCoercedNumber",
  (inst, def) => {
    core.coerce.$ZodCoercedNumber.init(inst, def); // no format checks
    schemas.ZodType.init(inst, def);
    // const _super = inst._parse;
    // inst._parse = (input, ctx) => {
    //   if (def.coerce) {
    //     try {
    //       input = Number(input);
    //     } catch (_) {
    //       return core.$fail(
    //         [
    //           {
    //             origin: "number",
    //             code: "invalid_type",
    //             level: "abort",
    //             input,
    //             def,
    //           },
    //         ],
    //         true
    //       );
    //     }
    //   }
    //   return _super(input, ctx);
    // };
  }
);

interface ZodNumberParams extends util.TypeParams<ZodCoercedNumber, "coerce"> {}
const _number = util.factory(() => ZodCoercedNumber, {
  type: "number",
  coerce: true,
});
export function number(checks?: core.$ZodCheck<number>[]): ZodCoercedNumber;
export function number(params?: string | ZodNumberParams, checks?: core.$ZodCheck<number>[]): ZodCoercedNumber;
export function number(...args: any[]): ZodCoercedNumber {
  return _number(...args);
}

//////////    ZodCoercedBoolean    //////////
export interface ZodCoercedBooleanDef extends core.$ZodBooleanDef {}
export interface ZodCoercedBoolean extends core.$ZodBoolean<unknown>, schemas.ZodType<boolean, unknown> {
  "~def": ZodCoercedBooleanDef;
  "~isst": core.$ZodIssueInvalidType<"boolean">;
}

export const ZodCoercedBoolean: core.$constructor<ZodCoercedBoolean> = /*@__PURE__*/ core.$constructor(
  "ZodCoercedBoolean",
  (inst, def) => {
    core.coerce.$ZodCoercedBoolean.init(inst, def); // no format checks
    schemas.ZodType.init(inst, def);
    // const _super = inst._parse;
    // inst._parse = (input, ctx) => {
    //   if (def.coerce) {
    //     try {
    //       input = Boolean(input);
    //     } catch (_) {
    //       return core.$fail(
    //         [
    //           {
    //             origin: "boolean",
    //             code: "invalid_type",
    //             level: "abort",
    //             input,
    //             def,
    //           },
    //         ],
    //         true
    //       );
    //     }
    //   }
    //   return _super(input, ctx);
    // };
  }
);

interface ZodBooleanParams extends util.TypeParams<ZodCoercedBoolean, "coerce"> {}
const _boolean = util.factory(() => ZodCoercedBoolean, {
  type: "boolean",
  coerce: true,
});

export function boolean(checks?: core.$ZodCheck<boolean>[]): ZodCoercedBoolean;
export function boolean(params?: string | ZodBooleanParams, checks?: core.$ZodCheck<boolean>[]): ZodCoercedBoolean;
export function boolean(...args: any[]): ZodCoercedBoolean {
  return _boolean(...args);
}

//////////    ZodCoercedBigInt    //////////
export interface ZodCoercedBigIntDef extends core.$ZodBigIntDef {}
export interface ZodCoercedBigInt extends core.$ZodBigInt<unknown>, schemas.ZodType<bigint, unknown> {
  "~def": ZodCoercedBigIntDef;
  "~isst": core.$ZodIssueInvalidType<"bigint">;
}

export const ZodCoercedBigInt: core.$constructor<ZodCoercedBigInt> = /*@__PURE__*/ core.$constructor(
  "ZodCoercedBigInt",
  (inst, def) => {
    core.coerce.$ZodCoercedBigInt.init(inst, def); // no format checks
    schemas.ZodType.init(inst, def);
    // const _super = inst._parse;
    // inst._parse = (input, ctx) => {
    //   if (def.coerce) {
    //     try {
    //       input = BigInt(input as any);
    //     } catch (_) {
    //       return core.$fail(
    //         [
    //           {
    //             origin: "bigint",
    //             code: "invalid_type",
    //             level: "abort",
    //             input,
    //             def,
    //           },
    //         ],
    //         true
    //       );
    //     }
    //   }
    //   return _super(input, ctx);
    // };
  }
);

interface ZodBigIntParams extends util.TypeParams<ZodCoercedBigInt, "coerce"> {}
const _bigint = util.factory(() => ZodCoercedBigInt, {
  type: "bigint",
  coerce: true,
});

export function bigint(checks?: core.$ZodCheck<bigint>[]): ZodCoercedBigInt;
export function bigint(params?: string | ZodBigIntParams, checks?: core.$ZodCheck<bigint>[]): ZodCoercedBigInt;
export function bigint(...args: any[]): ZodCoercedBigInt {
  return _bigint(...args);
}

//////////    ZodCoercedDate    //////////
export interface ZodCoercedDateDef extends core.$ZodDateDef {}
export interface ZodCoercedDate extends core.$ZodDate<unknown>, schemas.ZodType<Date, unknown> {
  "~def": ZodCoercedDateDef;
  "~isst": core.$ZodIssueInvalidType<"date">;
}

export const ZodCoercedDate: core.$constructor<ZodCoercedDate> = /*@__PURE__*/ core.$constructor(
  "ZodCoercedDate",
  (inst, def) => {
    core.coerce.$ZodCoercedDate.init(inst, def); // no format checks
    schemas.ZodType.init(inst, def);
    // const _super = inst._parse;
    // inst._parse = (input, ctx) => {
    //   if (def.coerce) {
    //     try {
    //       input = new Date(input as any);
    //     } catch (_) {
    //       return core.$fail(
    //         [
    //           {
    //             origin: "date",
    //             code: "invalid_type",
    //             level: "abort",
    //             input,
    //             def,
    //           },
    //         ],
    //         true
    //       );
    //     }
    //   }
    //   return _super(input, ctx);
    // };
  }
);

interface ZodDateParams extends util.TypeParams<ZodCoercedDate, "coerce"> {}
const _date = util.factory(() => ZodCoercedDate, {
  type: "date",
  coerce: true,
});

export function date(checks?: core.$ZodCheck<Date>[]): ZodCoercedDate;
export function date(params?: string | ZodDateParams, checks?: core.$ZodCheck<Date>[]): ZodCoercedDate;
export function date(...args: any[]): ZodCoercedDate {
  return _date(...args);
}
