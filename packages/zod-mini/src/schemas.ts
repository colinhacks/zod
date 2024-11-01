import * as core from "zod-core";

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniType        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: core.$ZodFailure };
export interface ZodMiniTypeDef extends core.$ZodTypeDef {}
export interface ZodMiniType<Output = unknown, Input = unknown>
  extends core.$ZodType<Output, Input> {
  _def: ZodMiniTypeDef;
  // parse methods
  $parse(
    data: unknown,
    params?: Partial<core.$ParseContext>
  ): core.$SyncParseResult<Output>;
  parse(data: unknown, params?: Partial<core.$ParseContext>): Output;
  safeParse(
    data: unknown,
    params?: Partial<core.$ParseContext>
  ): SafeParseResult<Output>;
  parseAsync(
    data: unknown,
    params?: Partial<core.$ParseContext>
  ): Promise<Output>;
  safeParseAsync(
    data: unknown,
    params?: Partial<core.$ParseContext>
  ): Promise<SafeParseResult<Output>>;
}
export const ZodMiniType: core.$constructor<ZodMiniType> = core.$constructor(
  "ZodMiniType",
  (inst) => {
    inst.parse = (data, params) => {
      const result = inst._parse(data, params);
      if (result instanceof Promise) {
        throw new Error(
          "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
        );
      }
      if (core.succeeded(result)) return result;
      throw result;
    };
    inst.safeParse = (data, params) => {
      const result = inst._parse(data, params);
      if (result instanceof Promise)
        throw new Error(
          "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
        );
      return core.succeeded(result)
        ? { success: true, data: result }
        : { success: false, error: result };
    };
    inst.parseAsync = async (data, params) => {
      let result = inst._parse(data, params);
      if (result instanceof Promise) result = await result;
      if (core.succeeded(result)) return result;
      throw result;
    };
    inst.safeParseAsync = async (data, params) => {
      let result = inst._parse(data, params);
      if (result instanceof Promise) result = await result;
      return core.succeeded(result)
        ? { success: true, data: result }
        : { success: false, error: result };
    };
    return inst;
  }
);

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniString      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniStringDef extends core.$ZodStringDef {}
export interface ZodMiniString
  extends core.$ZodString,
    ZodMiniType<string, string> {
  _def: ZodMiniStringDef;
}
export const ZodMiniString: core.$constructor<ZodMiniString> =
  /*@__PURE__*/ core.$constructor("ZodMiniString", (inst, def) => {
    core.$ZodString.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniUUID        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniUUID
  extends core.$ZodUUID,
    ZodMiniType<string, string> {
  _def: core.$ZodUUIDDef;
}
export const ZodMiniUUID: core.$constructor<ZodMiniUUID> =
  /*@__PURE__*/ core.$constructor("ZodMiniUUID", (inst, def): void => {
    core.$ZodUUID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniEmail       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniEmailDef extends core.$ZodEmailDef {}
export interface ZodMiniEmail
  extends core.$ZodEmail,
    ZodMiniType<string, string> {
  _def: ZodMiniEmailDef;
}
export const ZodMiniEmail: core.$constructor<ZodMiniEmail> =
  /*@__PURE__*/ core.$constructor("ZodMiniEmail", (inst, def) => {
    core.$ZodEmail.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniURL         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniURLDef extends core.$ZodURLDef {}
export interface ZodMiniURL extends core.$ZodURL, ZodMiniType<string, string> {
  _def: ZodMiniURLDef;
}
export const ZodMiniURL: core.$constructor<ZodMiniURL> =
  /*@__PURE__*/ core.$constructor("ZodMiniURL", function (inst, def) {
    core.$ZodURL.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniEmoji       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniEmojiDef extends core.$ZodEmojiDef {}
export interface ZodMiniEmoji
  extends core.$ZodEmoji,
    ZodMiniType<string, string> {
  _def: ZodMiniEmojiDef;
}
export const ZodMiniEmoji: core.$constructor<ZodMiniEmoji> =
  /*@__PURE__*/ core.$constructor("ZodMiniEmoji", (inst, def) => {
    core.$ZodEmoji.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniNanoID      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniNanoIDDef extends core.$ZodNanoIDDef {}
export interface ZodMiniNanoID
  extends core.$ZodNanoID,
    ZodMiniType<string, string> {
  _def: ZodMiniNanoIDDef;
}
export const ZodMiniNanoID: core.$constructor<ZodMiniNanoID> =
  /*@__PURE__*/ core.$constructor("ZodMiniNanoID", (inst, def) => {
    core.$ZodNanoID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniCUID        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniCUIDDef extends core.$ZodCUIDDef {}
export interface ZodMiniCUID
  extends core.$ZodCUID,
    ZodMiniType<string, string> {
  _def: ZodMiniCUIDDef;
}
export const ZodMiniCUID: core.$constructor<ZodMiniCUID> =
  /*@__PURE__*/ core.$constructor("ZodMiniCUID", (inst, def) => {
    core.$ZodCUID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniCUID2       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniCUID2Def extends core.$ZodCUID2Def {}
export interface ZodMiniCUID2
  extends core.$ZodCUID2,
    ZodMiniType<string, string> {
  _def: ZodMiniCUID2Def;
}
export const ZodMiniCUID2: core.$constructor<ZodMiniCUID2> =
  /*@__PURE__*/ core.$constructor("ZodMiniCUID2", (inst, def) => {
    core.$ZodCUID2.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniULID        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniULIDDef extends core.$ZodULIDDef {}
export interface ZodMiniULID
  extends core.$ZodULID,
    ZodMiniType<string, string> {
  _def: ZodMiniULIDDef;
}
export const ZodMiniULID: core.$constructor<ZodMiniULID> =
  /*@__PURE__*/ core.$constructor("ZodMiniULID", (inst, def) => {
    core.$ZodULID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniXID         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniXIDDef extends core.$ZodXIDDef {}
export interface ZodMiniXID extends core.$ZodXID, ZodMiniType<string, string> {
  _def: ZodMiniXIDDef;
}
export const ZodMiniXID: core.$constructor<ZodMiniXID> =
  /*@__PURE__*/ core.$constructor("ZodMiniXID", (inst, def) => {
    core.$ZodXID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniKSUID       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniKSUIDDef extends core.$ZodKSUIDDef {}
export interface ZodMiniKSUID
  extends core.$ZodKSUID,
    ZodMiniType<string, string> {
  _def: ZodMiniKSUIDDef;
}
export const ZodMiniKSUID: core.$constructor<ZodMiniKSUID> =
  /*@__PURE__*/ core.$constructor("ZodMiniKSUID", (inst, def) => {
    core.$ZodKSUID.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   ZodMiniISODateTime    //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniISODateTimeDef extends core.$ZodISODateTimeDef {}
export interface ZodMiniISODateTime
  extends core.$ZodISODateTime,
    ZodMiniType<string, string> {
  _def: ZodMiniISODateTimeDef;
}
export const ZodMiniISODateTime: core.$constructor<ZodMiniISODateTime> =
  /*@__PURE__*/ core.$constructor("ZodMiniISODateTime", (inst, def) => {
    core.$ZodISODateTime.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniISODate     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniISODateDef extends core.$ZodISODateDef {}
export interface ZodMiniISODate
  extends core.$ZodISODate,
    ZodMiniType<string, string> {
  _def: ZodMiniISODateDef;
}
export const ZodMiniISODate: core.$constructor<ZodMiniISODate> =
  /*@__PURE__*/ core.$constructor("ZodMiniISODate", (inst, def) => {
    core.$ZodISODate.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniISOTime     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniISOTimeDef extends core.$ZodISOTimeDef {}
export interface ZodMiniISOTime
  extends core.$ZodISOTime,
    ZodMiniType<string, string> {
  _def: ZodMiniISOTimeDef;
}
export const ZodMiniISOTime: core.$constructor<ZodMiniISOTime> =
  /*@__PURE__*/ core.$constructor("ZodMiniISOTime", (inst, def) => {
    core.$ZodISOTime.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniDuration    //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniDurationDef extends core.$ZodDurationDef {}
export interface ZodMiniDuration
  extends core.$ZodDuration,
    ZodMiniType<string, string> {
  _def: ZodMiniDurationDef;
}
export const ZodMiniDuration: core.$constructor<ZodMiniDuration> =
  /*@__PURE__*/ core.$constructor("ZodMiniDuration", (inst, def) => {
    core.$ZodDuration.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniIP          //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniIPDef extends core.$ZodIPDef {}
export interface ZodMiniIP extends core.$ZodIP, ZodMiniType<string, string> {
  _def: ZodMiniIPDef;
}
export const ZodMiniIP: core.$constructor<ZodMiniIP> =
  /*@__PURE__*/ core.$constructor("ZodMiniIP", (inst, def) => {
    core.$ZodIP.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniIPv4        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniIPv4Def extends core.$ZodIPv4Def {}
export interface ZodMiniIPv4
  extends core.$ZodIPv4,
    ZodMiniType<string, string> {
  _def: ZodMiniIPv4Def;
}
export const ZodMiniIPv4: core.$constructor<ZodMiniIPv4> =
  /*@__PURE__*/ core.$constructor("ZodMiniIPv4", (inst, def) => {
    core.$ZodIPv4.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniIPv6        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniIPv6Def extends core.$ZodIPv6Def {}
export interface ZodMiniIPv6
  extends core.$ZodIPv6,
    ZodMiniType<string, string> {
  _def: ZodMiniIPv6Def;
}
export const ZodMiniIPv6: core.$constructor<ZodMiniIPv6> =
  /*@__PURE__*/ core.$constructor("ZodMiniIPv6", (inst, def) => {
    core.$ZodIPv6.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniBase64      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniBase64Def extends core.$ZodBase64Def {}
export interface ZodMiniBase64
  extends core.$ZodBase64,
    ZodMiniType<string, string> {
  _def: ZodMiniBase64Def;
}
export const ZodMiniBase64: core.$constructor<ZodMiniBase64> =
  /*@__PURE__*/ core.$constructor("ZodMiniBase64", (inst, def) => {
    core.$ZodBase64.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniJSONString  //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniJSONStringDef extends core.$ZodJSONStringDef {}
export interface ZodMiniJSONString
  extends core.$ZodJSONString,
    ZodMiniType<string, string> {
  _def: ZodMiniJSONStringDef;
}
export const ZodMiniJSONString: core.$constructor<ZodMiniJSONString> =
  /*@__PURE__*/ core.$constructor("ZodMiniJSONString", (inst, def) => {
    core.$ZodJSONString.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniE164        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniE164Def extends core.$ZodE164Def {}
export interface ZodMiniE164
  extends core.$ZodE164,
    ZodMiniType<string, string> {
  _def: ZodMiniE164Def;
}
export const ZodMiniE164: core.$constructor<ZodMiniE164> =
  /*@__PURE__*/ core.$constructor("ZodMiniE164", (inst, def) => {
    core.$ZodE164.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniJWT         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniJWTDef extends core.$ZodJWTDef {}
export interface ZodMiniJWT extends core.$ZodJWT, ZodMiniType<string, string> {
  _def: ZodMiniJWTDef;
}
export const ZodMiniJWT: core.$constructor<ZodMiniJWT> =
  /*@__PURE__*/ core.$constructor("ZodMiniJWT", (inst, def) => {
    core.$ZodJWT.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniNumber      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniNumberDef extends core.$ZodNumberDef {}
export interface ZodMiniNumber
  extends core.$ZodNumber,
    ZodMiniType<number, unknown> {
  _def: ZodMiniNumberDef;
}
export const ZodMiniNumberFast: core.$constructor<ZodMiniNumber> =
  /*@__PURE__*/ core.$constructor("ZodMiniNumber", (inst, def) => {
    core.$ZodNumberFast.init(inst, def);
    ZodMiniType.init(inst, def);
  });

export const ZodMiniNumber: core.$constructor<ZodMiniNumber> =
  /*@__PURE__*/ core.$constructor("ZodMiniNumber", (inst, def) => {
    core.$ZodNumber.init(inst, def); // no format checks
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniBoolean     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniBooleanDef extends core.$ZodBooleanDef {}
export interface ZodMiniBoolean
  extends core.$ZodBoolean,
    ZodMiniType<boolean, unknown> {
  _def: ZodMiniBooleanDef;
}
export const ZodMiniBoolean: core.$constructor<ZodMiniBoolean> =
  /*@__PURE__*/ core.$constructor("ZodMiniBoolean", (inst, def) => {
    core.$ZodBoolean.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniBigInt      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniBigIntDef extends core.$ZodBigIntDef {}
export interface ZodMiniBigInt
  extends core.$ZodBigInt,
    ZodMiniType<bigint, unknown> {
  _def: ZodMiniBigIntDef;
}
export const ZodMiniBigInt: core.$constructor<ZodMiniBigInt> =
  /*@__PURE__*/ core.$constructor("ZodMiniBigInt", (inst, def) => {
    core.$ZodBigInt.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniSymbol      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniSymbolDef extends core.$ZodSymbolDef {}
export interface ZodMiniSymbol
  extends core.$ZodSymbol,
    ZodMiniType<symbol, unknown> {
  _def: ZodMiniSymbolDef;
}
export const ZodMiniSymbol: core.$constructor<ZodMiniSymbol> =
  /*@__PURE__*/ core.$constructor("ZodMiniSymbol", (inst, def) => {
    core.$ZodSymbol.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniUndefined   //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniUndefinedDef extends core.$ZodUndefinedDef {}
export interface ZodMiniUndefined
  extends core.$ZodUndefined,
    ZodMiniType<undefined, undefined> {
  _def: ZodMiniUndefinedDef;
}
export const ZodMiniUndefined: core.$constructor<ZodMiniUndefined> =
  /*@__PURE__*/ core.$constructor("ZodMiniUndefined", (inst, def) => {
    core.$ZodUndefined.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniNull        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniNullDef extends core.$ZodNullDef {}
export interface ZodMiniNull extends core.$ZodNull, ZodMiniType<null, null> {
  _def: ZodMiniNullDef;
}
export const ZodMiniNull: core.$constructor<ZodMiniNull> =
  /*@__PURE__*/ core.$constructor("ZodMiniNull", (inst, def) => {
    core.$ZodNull.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniAny         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniAnyDef extends core.$ZodAnyDef {}
export interface ZodMiniAny extends core.$ZodAny, ZodMiniType<any, any> {
  _def: ZodMiniAnyDef;
}
export const ZodMiniAny: core.$constructor<ZodMiniAny> =
  /*@__PURE__*/ core.$constructor("ZodMiniAny", (inst, def) => {
    core.$ZodAny.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniUnknown     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniUnknownDef extends core.$ZodUnknownDef {}
export interface ZodMiniUnknown
  extends core.$ZodUnknown,
    ZodMiniType<unknown, unknown> {
  _def: ZodMiniUnknownDef;
}
export const ZodMiniUnknown: core.$constructor<ZodMiniUnknown> =
  /*@__PURE__*/ core.$constructor("ZodMiniUnknown", (inst, def) => {
    core.$ZodUnknown.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniNever       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniNeverDef extends core.$ZodNeverDef {}
export interface ZodMiniNever
  extends core.$ZodNever,
    ZodMiniType<never, never> {
  _def: ZodMiniNeverDef;
}
export const ZodMiniNever: core.$constructor<ZodMiniNever> =
  /*@__PURE__*/ core.$constructor("ZodMiniNever", (inst, def) => {
    core.$ZodNever.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniVoid        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniVoidDef extends core.$ZodVoidDef {}
export interface ZodMiniVoid extends core.$ZodVoid, ZodMiniType<void, void> {
  _def: ZodMiniVoidDef;
}
export const ZodMiniVoid: core.$constructor<ZodMiniVoid> =
  /*@__PURE__*/ core.$constructor("ZodMiniVoid", (inst, def) => {
    core.$ZodVoid.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniDate        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniDateDef extends core.$ZodDateDef {}
export interface ZodMiniDate extends core.$ZodDate, ZodMiniType<Date, Date> {
  _def: ZodMiniDateDef;
}
export const ZodMiniDate: core.$constructor<ZodMiniDate> =
  /*@__PURE__*/ core.$constructor("ZodMiniDate", (inst, def) => {
    core.$ZodDate.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniArray       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniArrayDef extends core.$ZodArrayDef {}
export interface ZodMiniArray<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodArray<T>,
    ZodMiniType<T["_output"][], T["_input"][]> {
  _def: ZodMiniArrayDef;
}
export const ZodMiniArray: core.$constructor<ZodMiniArray> =
  /*@__PURE__*/ core.$constructor("ZodMiniArray", (inst, def) => {
    core.$ZodArray.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniObject      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniRawShape {
  [k: string]: ZodMiniType;
}

export interface ZodMiniObjectDef extends core.$ZodObjectDef {
  shape: ZodMiniRawShape;
}
export interface ZodMiniObject<Shape extends ZodMiniRawShape = ZodMiniRawShape>
  extends core.$ZodObject<Shape>,
    ZodMiniType<core.InferObjectOutput<Shape>, core.InferObjectInput<Shape>> {
  _def: ZodMiniObjectDef;
  shape: Shape;
}
export const ZodMiniObject: core.$constructor<ZodMiniObject> =
  /*@__PURE__*/ core.$constructor("ZodMiniObject", (inst, def) => {
    core.$ZodObject.init(inst, def);
    ZodMiniType.init(inst, def);
    inst.shape = def.shape;
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniUnion       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniUnionDef extends core.$ZodUnionDef {}
export interface ZodMiniUnion<T extends ZodMiniType[] = ZodMiniType[]>
  extends core.$ZodUnion<T>,
    ZodMiniType<T[number]["_output"], T[number]["_input"]> {
  _def: ZodMiniUnionDef;
}
export const ZodMiniUnion: core.$constructor<ZodMiniUnion> =
  /*@__PURE__*/ core.$constructor("ZodMiniUnion", (inst, def) => {
    core.$ZodUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
////////// ZodMiniDiscriminatedUnion //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniDiscriminatedUnionDef
  extends core.$ZodDiscriminatedUnionDef {}
export interface ZodMiniDiscriminatedUnion<
  Options extends ZodMiniType[] = ZodMiniType[],
> extends core.$ZodDiscriminatedUnion<Options>,
    ZodMiniType<Options[number]["_output"], Options[number]["_input"]> {
  _def: ZodMiniDiscriminatedUnionDef;
}
export const ZodMiniDiscriminatedUnion: core.$constructor<ZodMiniDiscriminatedUnion> =
  /*@__PURE__*/
  core.$constructor("ZodMiniDiscriminatedUnion", (inst, def) => {
    core.$ZodDiscriminatedUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   ZodMiniIntersection   //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniIntersectionDef extends core.$ZodIntersectionDef {}
export interface ZodMiniIntersection<
  A extends ZodMiniType = ZodMiniType,
  B extends ZodMiniType = ZodMiniType,
> extends core.$ZodIntersection<A, B>,
    ZodMiniType<A["_output"] & B["_output"], A["_input"] & B["_input"]> {
  _def: ZodMiniIntersectionDef;
}
export const ZodMiniIntersection: core.$constructor<ZodMiniIntersection> =
  /*@__PURE__*/ core.$constructor("ZodMiniIntersection", (inst, def) => {
    core.$ZodIntersection.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniTuple       //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniTupleDef extends core.$ZodTupleDef {}
type ZodTupleItems = ZodMiniType[];
export interface ZodMiniTuple<
  T extends ZodTupleItems = ZodTupleItems,
  Rest extends ZodMiniType | null = ZodMiniType | null,
> extends core.$ZodTuple<T, Rest>,
    ZodMiniType<core.TupleOutputType<T, Rest>, core.TupleInputType<T, Rest>> {
  _def: ZodMiniTupleDef;
}
export const ZodMiniTuple: core.$constructor<ZodMiniTuple> =
  /*@__PURE__*/ core.$constructor("ZodMiniTuple", (inst, def) => {
    core.$ZodTuple.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniRecord      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniHasValues
  extends ZodMiniType<PropertyKey, PropertyKey> {
  _values: Set<PropertyKey>;
}

export interface ZodMiniHasPattern
  extends ZodMiniType<PropertyKey, PropertyKey> {
  _pattern: RegExp;
}

type ZodMiniRecordKey = ZodMiniHasValues | ZodMiniHasPattern;
export interface ZodMiniRecordDef extends core.$ZodRecordDef {}
export interface ZodMiniRecord<
  K extends ZodMiniRecordKey = ZodMiniRecordKey,
  V extends ZodMiniType = ZodMiniType,
> extends core.$ZodRecord<K, V>,
    ZodMiniType<
      core.RecordType<K["_output"], V["_output"]>,
      core.RecordType<K["_input"], V["_input"]>
    > {
  _def: ZodMiniRecordDef;
}
export const ZodMiniRecord: core.$constructor<ZodMiniRecord> =
  /*@__PURE__*/ core.$constructor("ZodMiniRecord", (inst, def) => {
    core.$ZodRecord.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniMap         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniMapDef extends core.$ZodMapDef {}
export interface ZodMiniMap<
  Key extends ZodMiniType = ZodMiniType,
  Value extends ZodMiniType = ZodMiniType,
> extends core.$ZodMap<Key, Value>,
    ZodMiniType<
      Map<Key["_output"], Value["_output"]>,
      Map<Key["_input"], Value["_input"]>
    > {
  _def: ZodMiniMapDef;
}
export const ZodMiniMap: core.$constructor<ZodMiniMap> =
  /*@__PURE__*/ core.$constructor("ZodMiniMap", (inst, def) => {
    core.$ZodMap.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniSet         //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniSetDef extends core.$ZodSetDef {}
export interface ZodMiniSet<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodSet<T>,
    ZodMiniType<Set<T["_output"]>, Set<T["_input"]>> {
  _def: ZodMiniSetDef;
}
export const ZodMiniSet: core.$constructor<ZodMiniSet> =
  /*@__PURE__*/ core.$constructor("ZodMiniSet", (inst, def) => {
    core.$ZodSet.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniEnum        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniEnumDef extends core.$ZodEnumDef {}
export interface ZodMiniEnum<T extends core.$EnumValues = core.$EnumValues>
  extends core.$ZodEnum<T>,
    ZodMiniType<core.InferEnumOutput<T>, core.InferEnumInput<T>> {
  _def: ZodMiniEnumDef;
  enum: core.$ValuesToEnum<T>;
}
export const ZodMiniEnum: core.$constructor<ZodMiniEnum> =
  /*@__PURE__*/ core.$constructor("ZodMiniEnum", (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniLiteral     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniLiteralDef extends core.$ZodEnumDef {}
export interface ZodMiniLiteral<T extends core.Primitive[] = core.Primitive[]>
  extends core.$ZodEnum<T>,
    ZodMiniType<core.InferEnumOutput<T>, core.InferEnumInput<T>> {
  _def: ZodMiniLiteralDef;
}
export const ZodMiniLiteral: core.$constructor<ZodMiniLiteral> =
  /*@__PURE__*/ core.$constructor("ZodMiniLiteral", (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////   ZodMiniNativeEnum     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniNativeEnumDef extends core.$ZodEnumDef {}
export interface ZodMiniNativeEnum<T extends core.$EnumLike = core.$EnumLike>
  extends core.$ZodEnum<T>,
    ZodMiniType<core.InferEnumOutput<T>, core.InferEnumInput<T>> {
  _def: ZodMiniNativeEnumDef;
}
export const ZodMiniNativeEnum: core.$constructor<ZodMiniNativeEnum> =
  /*@__PURE__*/ core.$constructor("ZodMiniNativeEnum", (inst, def) => {
    core.$ZodEnum.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniFile        //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export interface ZodMiniFileDef extends core.$ZodFileDef {}
export interface ZodMiniFile extends core.$ZodFile, ZodMiniType<File, File> {
  _def: ZodMiniFileDef;
}
export const ZodMiniFile: core.$constructor<ZodMiniFile> =
  /*@__PURE__*/ core.$constructor("ZodMiniFile", (inst, def) => {
    core.$ZodFile.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////      ZodMiniEffect      //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniEffectDef extends core.$ZodEffectDef {}
export interface ZodMiniEffect<O = unknown, I = unknown>
  extends core.$ZodEffect<O, I>,
    ZodMiniType<O, I> {
  _def: ZodMiniEffectDef;
}
export const ZodMiniEffect: core.$constructor<ZodMiniEffect> =
  /*@__PURE__*/ core.$constructor("ZodMiniEffect", (inst, def) => {
    core.$ZodEffect.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////     ZodMiniOptional     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniOptionalDef extends core.$ZodOptionalDef {}
export interface ZodMiniOptional<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodOptional<T>,
    ZodMiniType<T["_output"] | undefined, T["_input"] | undefined> {
  _def: ZodMiniOptionalDef;
}
export const ZodMiniOptional: core.$constructor<ZodMiniOptional> =
  /*@__PURE__*/ core.$constructor("ZodMiniOptional", (inst, def) => {
    core.$ZodOptional.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniNullable   //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniNullableDef extends core.$ZodNullableDef {}
export interface ZodMiniNullable<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodNullable<T>,
    ZodMiniType<T["_output"] | null, T["_input"] | null> {
  _def: ZodMiniNullableDef;
}
export const ZodMiniNullable: core.$constructor<ZodMiniNullable> =
  /*@__PURE__*/ core.$constructor("ZodMiniNullable", (inst, def) => {
    core.$ZodNullable.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniSuccess    //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniSuccessDef extends core.$ZodSuccessDef {}
export interface ZodMiniSuccess<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodSuccess<T>,
    ZodMiniType<boolean, T["_input"]> {
  _def: ZodMiniSuccessDef;
}
export const ZodMiniSuccess: core.$constructor<ZodMiniSuccess> =
  /*@__PURE__*/ core.$constructor("ZodMiniSuccess", (inst, def) => {
    core.$ZodSuccess.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniDefault    //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniDefaultDef extends core.$ZodDefaultDef {}
export interface ZodMiniDefault<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodDefault<T>,
    ZodMiniType<core.NoUndefined<T["_output"]>, core.input<T> | undefined> {
  _def: ZodMiniDefaultDef;
}
export const ZodMiniDefault: core.$constructor<ZodMiniDefault> =
  /*@__PURE__*/ core.$constructor("ZodMiniDefault", (inst, def) => {
    core.$ZodDefault.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniCatch      //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniCatchDef extends core.$ZodCatchDef {}
export interface ZodMiniCatch<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodCatch<T>,
    ZodMiniType<T["_output"], unknown> {
  _def: ZodMiniCatchDef;
}
export const ZodMiniCatch: core.$constructor<ZodMiniCatch> =
  /*@__PURE__*/ core.$constructor("ZodMiniCatch", (inst, def) => {
    core.$ZodCatch.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniNaN        //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniNaNDef extends core.$ZodNaNDef {}
export interface ZodMiniNaN extends core.$ZodNaN, ZodMiniType<number, number> {
  _def: ZodMiniNaNDef;
}
export const ZodMiniNaN: core.$constructor<ZodMiniNaN> =
  /*@__PURE__*/ core.$constructor("ZodMiniNaN", (inst, def) => {
    core.$ZodNaN.init(inst, def);
    ZodMiniType.init(inst, def);
  });

////////////////////////////////////////////
////////////////////////////////////////////
//////////                        //////////
//////////      ZodMiniPipeline   //////////
//////////                        //////////
////////////////////////////////////////////
////////////////////////////////////////////
export interface ZodMiniPipelineDef extends core.$ZodPipelineDef {}
export interface ZodMiniPipeline<
  A extends ZodMiniType = ZodMiniType,
  B extends ZodMiniType = ZodMiniType,
> extends core.$ZodPipeline<A, B>,
    ZodMiniType<B["_output"], A["_input"]> {
  _def: ZodMiniPipelineDef;
}
export const ZodMiniPipeline: core.$constructor<ZodMiniPipeline> =
  /*@__PURE__*/ core.$constructor("ZodMiniPipeline", (inst, def) => {
    core.$ZodPipeline.init(inst, def);
    ZodMiniType.init(inst, def);
  });

/////////////////////////////////////////////
/////////////////////////////////////////////
//////////                         //////////
//////////     ZodMiniReadonly     //////////
//////////                         //////////
/////////////////////////////////////////////
/////////////////////////////////////////////
export interface ZodMiniReadonlyDef extends core.$ZodReadonlyDef {}
export interface ZodMiniReadonly<T extends ZodMiniType = ZodMiniType>
  extends core.$ZodReadonly<T>,
    ZodMiniType<
      core.MakeReadonly<T["_output"]>,
      core.MakeReadonly<core.input<T>>
    > {
  _def: ZodMiniReadonlyDef;
}
export const ZodMiniReadonly: core.$constructor<ZodMiniReadonly> =
  /*@__PURE__*/ core.$constructor("ZodMiniReadonly", (inst, def) => {
    core.$ZodReadonly.init(inst, def);
    ZodMiniType.init(inst, def);
  });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
////////////                              ////////////
////////////    ZodMiniTemplateLiteral    ////////////
////////////                              ////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
export interface ZodMiniTemplateLiteralDef
  extends core.$ZodTemplateLiteralDef {}
export interface ZodMiniTemplateLiteral<Template extends string = string>
  extends core.$ZodTemplateLiteral<Template>,
    ZodMiniType<Template, Template> {
  _def: ZodMiniTemplateLiteralDef;
}
export const ZodMiniTemplateLiteral: core.$constructor<ZodMiniTemplateLiteral> =
  /*@__PURE__*/ core.$constructor("ZodMiniTemplateLiteral", (inst, def) => {
    core.$ZodTemplateLiteral.init(inst, def);
    ZodMiniType.init(inst, def);
  });
