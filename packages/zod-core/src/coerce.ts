import * as base from "./base.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

//////////    $ZodCoercedString    //////////

export interface $ZodCoercedStringDef extends schemas.$ZodStringDef {}
export interface $ZodCoercedString
  extends schemas.$ZodString<unknown>,
    base.$ZodType<string, unknown> {
  _def: $ZodCoercedStringDef;
}

export const $ZodCoercedString: base.$constructor<$ZodCoercedString> =
  /*@__PURE__*/ base.$constructor("$ZodCoercedString", (inst, def) => {
    schemas.$ZodString.init(inst, def); // no format checks
    base.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = String(input);
        } catch (_) {
          return base.$fail(
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

interface $ZodStringParams
  extends util.TypeParams<$ZodCoercedString, "coerce"> {}
export const string: util.PrimitiveFactory<
  $ZodStringParams,
  $ZodCoercedString
> = util.factory($ZodCoercedString, {
  type: "string",
  coerce: true,
});

//////////    $ZodCoercedNumber    //////////
export interface $ZodCoercedNumberDef extends schemas.$ZodNumberDef {}
export interface $ZodCoercedNumber
  extends schemas.$ZodNumber<unknown>,
    base.$ZodType<number, unknown> {
  _def: $ZodCoercedNumberDef;
}

export const $ZodCoercedNumber: base.$constructor<$ZodCoercedNumber> =
  /*@__PURE__*/ base.$constructor("$ZodCoercedNumber", (inst, def) => {
    schemas.$ZodNumber.init(inst, def); // no format checks
    base.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = Number(input);
        } catch (_) {
          return base.$fail(
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
  extends util.TypeParams<$ZodCoercedNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  $ZodNumberParams,
  $ZodCoercedNumber
> = util.factory($ZodCoercedNumber, { type: "number", coerce: true });
//////////    $ZodCoercedBoolean    //////////
export interface $ZodCoercedBooleanDef extends schemas.$ZodBooleanDef {}
export interface $ZodCoercedBoolean
  extends schemas.$ZodBoolean<unknown>,
    base.$ZodType<boolean, unknown> {
  _def: $ZodCoercedBooleanDef;
}

export const $ZodCoercedBoolean: base.$constructor<$ZodCoercedBoolean> =
  /*@__PURE__*/ base.$constructor("$ZodCoercedBoolean", (inst, def) => {
    schemas.$ZodBoolean.init(inst, def); // no format checks
    base.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = Boolean(input);
        } catch (_) {
          return base.$fail(
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

interface $ZodBooleanParams extends util.TypeParams<$ZodCoercedBoolean> {}
export const boolean: util.PrimitiveFactory<
  $ZodBooleanParams,
  $ZodCoercedBoolean
> = util.factory($ZodCoercedBoolean, { type: "boolean", coerce: true });

//////////    $ZodCoercedBigInt    //////////
export interface $ZodCoercedBigIntDef extends schemas.$ZodBigIntDef {}
export interface $ZodCoercedBigInt
  extends schemas.$ZodBigInt<unknown>,
    base.$ZodType<bigint, unknown> {
  _def: $ZodCoercedBigIntDef;
}

export const $ZodCoercedBigInt: base.$constructor<$ZodCoercedBigInt> =
  /*@__PURE__*/ base.$constructor("$ZodCoercedBigInt", (inst, def) => {
    schemas.$ZodBigInt.init(inst, def); // no format checks
    base.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = BigInt(input as any);
        } catch (_) {
          return base.$fail(
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

interface $ZodBigIntParams extends util.TypeParams<$ZodCoercedBigInt> {}
export const bigint: util.PrimitiveFactory<
  $ZodBigIntParams,
  $ZodCoercedBigInt
> = util.factory($ZodCoercedBigInt, { type: "bigint", coerce: true });

//////////    $ZodCoercedDate    //////////
export interface $ZodCoercedDateDef extends schemas.$ZodDateDef {}
export interface $ZodCoercedDate
  extends schemas.$ZodDate<unknown>,
    base.$ZodType<Date, unknown> {
  _def: $ZodCoercedDateDef;
}

export const $ZodCoercedDate: base.$constructor<$ZodCoercedDate> =
  /*@__PURE__*/ base.$constructor("$ZodCoercedDate", (inst, def) => {
    schemas.$ZodDate.init(inst, def); // no format checks
    base.$ZodType.init(inst, def);
    const _super = inst._typecheck;
    inst._typecheck = (input, ctx) => {
      if (def.coerce) {
        try {
          input = new Date(input as any);
        } catch (_) {
          return base.$fail(
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

interface $ZodDateParams extends util.TypeParams<$ZodCoercedDate> {}
export const date: util.PrimitiveFactory<$ZodDateParams, $ZodCoercedDate> =
  util.factory($ZodCoercedDate, { type: "date", coerce: true });
