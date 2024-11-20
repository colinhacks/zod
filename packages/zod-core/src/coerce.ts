import * as core from "zod-core";
import * as util from "./api.js";

//////////    $ZodCoercedString    //////////

export interface $ZodCoercedStringDef extends core.$ZodStringDef {}
export interface $ZodCoercedString
  extends core.$ZodString<unknown>,
    core.$ZodType<string, unknown> {
  _def: $ZodCoercedStringDef;
}

export const $ZodCoercedString: core.$constructor<$ZodCoercedString> =
  /*@__PURE__*/ core.$constructor("$ZodCoercedString", (inst, def) => {
    core.$ZodString.init(inst, def); // no format checks
    core.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = String(input);
        } catch (_) {
          return core.$fail(
            [
              {
                origin: "string",
                code: "invalid_type",
                level: "abort",
                input,
                def,
              },
            ],
            true
          );
        }
      }
      return _super(input, ctx);
    };
  });

interface $ZodStringParams extends util.Params<$ZodCoercedString, "coerce"> {}
export const string: util.PrimitiveFactory<
  $ZodStringParams,
  $ZodCoercedString
> = util.factory($ZodCoercedString, {
  type: "string",
  coerce: true,
});

//////////    $ZodCoercedNumber    //////////
export interface $ZodCoercedNumberDef extends core.$ZodNumberDef {}
export interface $ZodCoercedNumber
  extends core.$ZodNumber<unknown>,
    core.$ZodType<number, unknown> {
  _def: $ZodCoercedNumberDef;
}

export const $ZodCoercedNumber: core.$constructor<$ZodCoercedNumber> =
  /*@__PURE__*/ core.$constructor("$ZodCoercedNumber", (inst, def) => {
    core.$ZodNumber.init(inst, def); // no format checks
    core.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = Number(input);
        } catch (_) {
          return core.$fail(
            [
              {
                origin: "number",
                code: "invalid_type",
                level: "abort",
                input,
                def,
              },
            ],
            true
          );
        }
      }
      return _super(input, ctx);
    };
  });

interface $ZodNumberParams
  extends util.Params<$ZodCoercedNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  $ZodNumberParams,
  $ZodCoercedNumber
> = util.factory($ZodCoercedNumber, { type: "number", coerce: true });
//////////    $ZodCoercedBoolean    //////////
export interface $ZodCoercedBooleanDef extends core.$ZodBooleanDef {}
export interface $ZodCoercedBoolean
  extends core.$ZodBoolean<unknown>,
    core.$ZodType<boolean, unknown> {
  _def: $ZodCoercedBooleanDef;
}

export const $ZodCoercedBoolean: core.$constructor<$ZodCoercedBoolean> =
  /*@__PURE__*/ core.$constructor("$ZodCoercedBoolean", (inst, def) => {
    core.$ZodBoolean.init(inst, def); // no format checks
    core.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = Boolean(input);
        } catch (_) {
          return core.$fail(
            [
              {
                origin: "boolean",
                code: "invalid_type",
                level: "abort",
                input,
                def,
              },
            ],
            true
          );
        }
      }
      return _super(input, ctx);
    };
  });

interface $ZodBooleanParams extends util.Params<$ZodCoercedBoolean> {}
export const boolean: util.PrimitiveFactory<
  $ZodBooleanParams,
  $ZodCoercedBoolean
> = util.factory($ZodCoercedBoolean, { type: "boolean", coerce: true });

//////////    $ZodCoercedBigInt    //////////
export interface $ZodCoercedBigIntDef extends core.$ZodBigIntDef {}
export interface $ZodCoercedBigInt
  extends core.$ZodBigInt<unknown>,
    core.$ZodType<bigint, unknown> {
  _def: $ZodCoercedBigIntDef;
}

export const $ZodCoercedBigInt: core.$constructor<$ZodCoercedBigInt> =
  /*@__PURE__*/ core.$constructor("$ZodCoercedBigInt", (inst, def) => {
    core.$ZodBigInt.init(inst, def); // no format checks
    core.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = BigInt(input as any);
        } catch (_) {
          return core.$fail(
            [
              {
                origin: "bigint",
                code: "invalid_type",
                level: "abort",
                input,
                def,
              },
            ],
            true
          );
        }
      }
      return _super(input, ctx);
    };
  });

interface $ZodBigIntParams extends util.Params<$ZodCoercedBigInt> {}
export const bigint: util.PrimitiveFactory<
  $ZodBigIntParams,
  $ZodCoercedBigInt
> = util.factory($ZodCoercedBigInt, { type: "bigint", coerce: true });

//////////    $ZodCoercedDate    //////////
export interface $ZodCoercedDateDef extends core.$ZodDateDef {}
export interface $ZodCoercedDate
  extends core.$ZodDate<unknown>,
    core.$ZodType<Date, unknown> {
  _def: $ZodCoercedDateDef;
}

export const $ZodCoercedDate: core.$constructor<$ZodCoercedDate> =
  /*@__PURE__*/ core.$constructor("$ZodCoercedDate", (inst, def) => {
    core.$ZodDate.init(inst, def); // no format checks
    core.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = new Date(input as any);
        } catch (_) {
          return core.$fail(
            [
              {
                origin: "date",
                code: "invalid_type",
                level: "abort",
                input,
                def,
              },
            ],
            true
          );
        }
      }
      return _super(input, ctx);
    };
  });

interface $ZodDateParams extends util.Params<$ZodCoercedDate> {}
export const date: util.PrimitiveFactory<$ZodDateParams, $ZodCoercedDate> =
  util.factory($ZodCoercedDate, { type: "date", coerce: true });
