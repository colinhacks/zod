import * as core from "zod-core";
import * as util from "zod-core/util";
import * as schemas from "./schemas.js";

//////////    ZodMiniCoercedString    //////////

export interface ZodMiniCoercedStringDef extends core.$ZodStringDef {}
export interface ZodMiniCoercedString
  extends core.$ZodString<unknown>,
    schemas.ZodMiniType<string, unknown> {
  _def: ZodMiniCoercedStringDef;
}

export const ZodMiniCoercedString: core.$constructor<ZodMiniCoercedString> =
  /*@__PURE__*/ core.$constructor("ZodMiniCoercedString", (inst, def) => {
    core.$ZodString.init(inst, def); // no format checks
    schemas.ZodMiniType.init(inst, def);
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

interface ZodMiniStringParams
  extends util.TypeParams<ZodMiniCoercedString, "coerce"> {}
export const string: util.PrimitiveFactory<
  ZodMiniStringParams,
  ZodMiniCoercedString
> = util.factory(ZodMiniCoercedString, {
  type: "string",
  coerce: true,
});

//////////    ZodMiniCoercedNumber    //////////
export interface ZodMiniCoercedNumberDef extends core.$ZodNumberDef {}
export interface ZodMiniCoercedNumber
  extends core.$ZodNumber<unknown>,
    schemas.ZodMiniType<number, unknown> {
  _def: ZodMiniCoercedNumberDef;
}

export const ZodMiniCoercedNumber: core.$constructor<ZodMiniCoercedNumber> =
  /*@__PURE__*/ core.$constructor("ZodMiniCoercedNumber", (inst, def) => {
    core.$ZodNumber.init(inst, def); // no format checks
    schemas.ZodMiniType.init(inst, def);
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

interface ZodMiniNumberParams
  extends util.TypeParams<ZodMiniCoercedNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  ZodMiniNumberParams,
  ZodMiniCoercedNumber
> = util.factory(ZodMiniCoercedNumber, { type: "number", coerce: true });
//////////    ZodMiniCoercedBoolean    //////////
export interface ZodMiniCoercedBooleanDef extends core.$ZodBooleanDef {}
export interface ZodMiniCoercedBoolean
  extends core.$ZodBoolean<unknown>,
    schemas.ZodMiniType<boolean, unknown> {
  _def: ZodMiniCoercedBooleanDef;
}

export const ZodMiniCoercedBoolean: core.$constructor<ZodMiniCoercedBoolean> =
  /*@__PURE__*/ core.$constructor("ZodMiniCoercedBoolean", (inst, def) => {
    core.$ZodBoolean.init(inst, def); // no format checks
    schemas.ZodMiniType.init(inst, def);
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

interface ZodMiniBooleanParams extends util.TypeParams<ZodMiniCoercedBoolean> {}
export const boolean: util.PrimitiveFactory<
  ZodMiniBooleanParams,
  ZodMiniCoercedBoolean
> = util.factory(ZodMiniCoercedBoolean, { type: "boolean", coerce: true });

//////////    ZodMiniCoercedBigInt    //////////
export interface ZodMiniCoercedBigIntDef extends core.$ZodBigIntDef {}
export interface ZodMiniCoercedBigInt
  extends core.$ZodBigInt<unknown>,
    schemas.ZodMiniType<bigint, unknown> {
  _def: ZodMiniCoercedBigIntDef;
}

export const ZodMiniCoercedBigInt: core.$constructor<ZodMiniCoercedBigInt> =
  /*@__PURE__*/ core.$constructor("ZodMiniCoercedBigInt", (inst, def) => {
    core.$ZodBigInt.init(inst, def); // no format checks
    schemas.ZodMiniType.init(inst, def);
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

interface ZodMiniBigIntParams extends util.TypeParams<ZodMiniCoercedBigInt> {}
export const bigint: util.PrimitiveFactory<
  ZodMiniBigIntParams,
  ZodMiniCoercedBigInt
> = util.factory(ZodMiniCoercedBigInt, { type: "bigint", coerce: true });

//////////    ZodMiniCoercedDate    //////////
export interface ZodMiniCoercedDateDef extends core.$ZodDateDef {}
export interface ZodMiniCoercedDate
  extends core.$ZodDate<unknown>,
    schemas.ZodMiniType<Date, unknown> {
  _def: ZodMiniCoercedDateDef;
}

export const ZodMiniCoercedDate: core.$constructor<ZodMiniCoercedDate> =
  /*@__PURE__*/ core.$constructor("ZodMiniCoercedDate", (inst, def) => {
    core.$ZodDate.init(inst, def); // no format checks
    schemas.ZodMiniType.init(inst, def);
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

interface ZodMiniDateParams extends util.TypeParams<ZodMiniCoercedDate> {}
export const date: util.PrimitiveFactory<
  ZodMiniDateParams,
  ZodMiniCoercedDate
> = util.factory(ZodMiniCoercedDate, { type: "date", coerce: true });
