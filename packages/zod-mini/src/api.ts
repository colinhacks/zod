import type * as core from "zod-core";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

/**
 * Dropped:
 * - effect
 * - function
 * - preprocess
 * - promise
 * - strictObject
 * - transformer
 * - oboolean
 * - onumber
 * - ostring
 */

interface ZodMiniStringParams
  extends util.Params<schemas.ZodMiniString, "coerce"> {}
export const string: util.PrimitiveFactory<
  ZodMiniStringParams,
  schemas.ZodMiniString
> = util.factory(schemas.ZodMiniString, {
  type: "string",
});

// ZodMiniUUID
interface ZodMiniUUIDParams
  extends util.Params<schemas.ZodMiniUUID, "coerce"> {}
export const uuid: util.PrimitiveFactory<
  ZodMiniUUIDParams,
  schemas.ZodMiniUUID
> = util.factory(schemas.ZodMiniUUID, {
  type: "string",
  format: "uuid",
  check: "string_format",
});

// ZodMiniEmail
interface ZodMiniEmailParams
  extends util.Params<schemas.ZodMiniEmail, "coerce"> {}
export const email: util.PrimitiveFactory<
  ZodMiniEmailParams,
  schemas.ZodMiniEmail
> = util.factory(schemas.ZodMiniEmail, {
  type: "string",
  format: "email",
  check: "string_format",
});

// ZodMiniURL
interface ZodMiniURLParams extends util.Params<schemas.ZodMiniURL, "coerce"> {}
export const url: util.PrimitiveFactory<ZodMiniURLParams, schemas.ZodMiniURL> =
  util.factory(schemas.ZodMiniURL, {
    type: "string",
    format: "url",
    check: "string_format",
  });

// ZodMiniEmoji
interface ZodMiniEmojiParams
  extends util.Params<schemas.ZodMiniEmoji, "coerce"> {}
export const emoji: util.PrimitiveFactory<
  ZodMiniEmojiParams,
  schemas.ZodMiniEmoji
> = util.factory(schemas.ZodMiniEmoji, {
  type: "string",
  format: "emoji",
  check: "string_format",
});

// ZodMiniNanoID
interface ZodMiniNanoIDParams
  extends util.Params<schemas.ZodMiniNanoID, "coerce"> {}
export const nanoid: util.PrimitiveFactory<
  ZodMiniNanoIDParams,
  schemas.ZodMiniNanoID
> = util.factory(schemas.ZodMiniNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
});

// ZodMiniCUID
interface ZodMiniCUIDParams
  extends util.Params<schemas.ZodMiniCUID, "coerce"> {}
export const cuid: util.PrimitiveFactory<
  ZodMiniCUIDParams,
  schemas.ZodMiniCUID
> = util.factory(schemas.ZodMiniCUID, {
  type: "string",
  format: "cuid",
  check: "string_format",
});

// ZodMiniCUID2
interface ZodMiniCUID2Params
  extends util.Params<schemas.ZodMiniCUID2, "coerce"> {}
export const cuid2: util.PrimitiveFactory<
  ZodMiniCUID2Params,
  schemas.ZodMiniCUID2
> = util.factory(schemas.ZodMiniCUID2, {
  type: "string",
  format: "cuid2",
  check: "string_format",
});

// ZodMiniULID
interface ZodMiniULIDParams
  extends util.Params<schemas.ZodMiniULID, "coerce"> {}
export const ulid: util.PrimitiveFactory<
  ZodMiniULIDParams,
  schemas.ZodMiniULID
> = util.factory(schemas.ZodMiniULID, {
  type: "string",
  format: "ulid",
  check: "string_format",
});

// ZodMiniXID
interface ZodMiniXIDParams extends util.Params<schemas.ZodMiniXID, "coerce"> {}
export const xid: util.PrimitiveFactory<ZodMiniXIDParams, schemas.ZodMiniXID> =
  util.factory(schemas.ZodMiniXID, {
    type: "string",
    format: "xid",
    check: "string_format",
  });

// ZodMiniKSUID
interface ZodMiniKSUIDParams
  extends util.Params<schemas.ZodMiniKSUID, "coerce"> {}
export const ksuid: util.PrimitiveFactory<
  ZodMiniKSUIDParams,
  schemas.ZodMiniKSUID
> = util.factory(schemas.ZodMiniKSUID, {
  type: "string",
  format: "ksuid",
  check: "string_format",
});

// ZodMiniDuration
interface ZodMiniDurationParams
  extends util.Params<schemas.ZodMiniDuration, "coerce"> {}
export const duration: util.PrimitiveFactory<
  ZodMiniDurationParams,
  schemas.ZodMiniDuration
> = util.factory(schemas.ZodMiniDuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});

// ZodMiniIP
interface ZodMiniIPParams extends util.Params<schemas.ZodMiniIP, "coerce"> {}
export const ip: util.PrimitiveFactory<ZodMiniIPParams, schemas.ZodMiniIP> =
  util.factory(schemas.ZodMiniIP, {
    type: "string",
    format: "ip",
    check: "string_format",
  });

// ZodMiniIPv4
interface ZodMiniIPv4Params
  extends util.Params<schemas.ZodMiniIPv4, "coerce"> {}
export const ipv4: util.PrimitiveFactory<
  ZodMiniIPv4Params,
  schemas.ZodMiniIPv4
> = util.factory(schemas.ZodMiniIPv4, {
  type: "string",
  format: "ipv4",
  check: "string_format",
});

// ZodMiniIPv6
interface ZodMiniIPv6Params
  extends util.Params<schemas.ZodMiniIPv6, "coerce"> {}
export const ipv6: util.PrimitiveFactory<
  ZodMiniIPv6Params,
  schemas.ZodMiniIPv6
> = util.factory(schemas.ZodMiniIPv6, {
  type: "string",
  format: "ipv6",
  check: "string_format",
});

// ZodMiniBase64
interface ZodMiniBase64Params
  extends util.Params<schemas.ZodMiniBase64, "coerce"> {}
export const base64: util.PrimitiveFactory<
  ZodMiniBase64Params,
  schemas.ZodMiniBase64
> = util.factory(schemas.ZodMiniBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
});

// ZodMiniJSONString
interface ZodMiniJSONStringParams
  extends util.Params<schemas.ZodMiniJSONString, "coerce"> {}
export const jsonString: util.PrimitiveFactory<
  ZodMiniJSONStringParams,
  schemas.ZodMiniJSONString
> = util.factory(schemas.ZodMiniJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
});

// ZodMiniE164
interface ZodMiniE164Params
  extends util.Params<schemas.ZodMiniE164, "coerce"> {}
export const e164: util.PrimitiveFactory<
  ZodMiniE164Params,
  schemas.ZodMiniE164
> = util.factory(schemas.ZodMiniE164, {
  type: "string",
  format: "e164",
  check: "string_format",
});

// ZodMiniJWT
interface ZodMiniJWTParams extends util.Params<schemas.ZodMiniJWT, "coerce"> {
  algorithm?: schemas.ZodMiniJWT["_def"]["algorithm"];
}
export const jwt: util.PrimitiveFactory<ZodMiniJWTParams, schemas.ZodMiniJWT> =
  util.factory(schemas.ZodMiniJWT, {
    type: "string",
    format: "jwt",
    check: "string_format",
  });

// number
interface ZodMiniNumberParams
  extends util.Params<schemas.ZodMiniNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  ZodMiniNumberParams,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumberFast, { type: "number" });

// int
interface ZodMiniIntParams extends ZodMiniNumberParams {}
export const int: util.PrimitiveFactory<
  ZodMiniIntParams,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "safeint" });

// float32
interface ZodMiniFloat32Params extends ZodMiniNumberParams {}
export const float32: util.PrimitiveFactory<
  ZodMiniFloat32Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "float32" });

// float64
interface ZodMiniFloat64Params extends ZodMiniNumberParams {}
export const float64: util.PrimitiveFactory<
  ZodMiniFloat64Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "float64" });

// int32
interface ZodMiniInt32Params extends ZodMiniNumberParams {}
export const int32: util.PrimitiveFactory<
  ZodMiniInt32Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "int32" });

// uint32
interface ZodMiniUInt32Params extends ZodMiniNumberParams {}
export const uint32: util.PrimitiveFactory<
  ZodMiniUInt32Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "uint32" });

// int64
interface ZodMiniInt64Params extends ZodMiniNumberParams {}
export const int64: util.PrimitiveFactory<
  ZodMiniInt64Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "int64" });

// uint64
interface ZodMiniUInt64Params extends ZodMiniNumberParams {}
export const uint64: util.PrimitiveFactory<
  ZodMiniUInt64Params,
  schemas.ZodMiniNumber
> = util.factory(schemas.ZodMiniNumber, { type: "number", format: "uint64" });

// boolean
interface ZodMiniBooleanParams extends util.Params<schemas.ZodMiniBoolean> {}
export const boolean: util.PrimitiveFactory<
  ZodMiniBooleanParams,
  schemas.ZodMiniBoolean
> = util.factory(schemas.ZodMiniBoolean, { type: "boolean" });

// bigint
interface ZodMiniBigIntParams extends util.Params<schemas.ZodMiniBigInt> {}
export const bigint: util.PrimitiveFactory<
  ZodMiniBigIntParams,
  schemas.ZodMiniBigInt
> = util.factory(schemas.ZodMiniBigInt, { type: "bigint" });

// symbol
interface ZodMiniSymbolParams extends util.Params<schemas.ZodMiniSymbol> {}
export const symbol: util.PrimitiveFactory<
  ZodMiniSymbolParams,
  schemas.ZodMiniSymbol
> = util.factory(schemas.ZodMiniSymbol, { type: "symbol" });

// date
interface ZodMiniDateParams extends util.Params<schemas.ZodMiniDate> {}
export const date: util.PrimitiveFactory<
  ZodMiniDateParams,
  schemas.ZodMiniDate
> = util.factory(schemas.ZodMiniDate, { type: "date" });

// undefined
interface ZodMiniUndefinedParams
  extends util.Params<schemas.ZodMiniUndefined> {}
const _undefined: util.PrimitiveFactory<
  ZodMiniUndefinedParams,
  schemas.ZodMiniUndefined
> = util.factory(schemas.ZodMiniUndefined, { type: "undefined" });
export { _undefined as undefined };

// null
interface ZodMiniNullParams extends util.Params<schemas.ZodMiniNull> {}
export const _null: util.PrimitiveFactory<
  ZodMiniNullParams,
  schemas.ZodMiniNull
> = util.factory(schemas.ZodMiniNull, { type: "null" });
export { _null as null };

// any
interface ZodMiniAnyParams extends util.Params<schemas.ZodMiniAny> {}
export const any: util.PrimitiveFactory<ZodMiniAnyParams, schemas.ZodMiniAny> =
  util.factory(schemas.ZodMiniAny, { type: "any" });

// unknown
interface ZodMiniUnknownParams extends util.Params<schemas.ZodMiniUnknown> {}
export const unknown: util.PrimitiveFactory<
  ZodMiniUnknownParams,
  schemas.ZodMiniUnknown
> = util.factory(schemas.ZodMiniUnknown, { type: "unknown" });

// never
interface ZodMiniNeverParams extends util.Params<schemas.ZodMiniNever> {}
export const never: util.PrimitiveFactory<
  ZodMiniNeverParams,
  schemas.ZodMiniNever
> = util.factory(schemas.ZodMiniNever, { type: "never" });

// void
interface ZodMiniVoidParams extends util.Params<schemas.ZodMiniVoid> {}
export const _void: util.PrimitiveFactory<
  ZodMiniVoidParams,
  schemas.ZodMiniVoid
> = util.factory(schemas.ZodMiniVoid, { type: "void" });
export { _void as void };

// array
interface ZodMiniArrayParams
  extends util.Params<schemas.ZodMiniArray, "element"> {}
export function array<T extends schemas.ZodMiniType>(
  element: T,
  params?: ZodMiniArrayParams
): schemas.ZodMiniArray<T> {
  return new schemas.ZodMiniArray({
    type: "array",
    element,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniArray<T>;
}

// object
interface ZodMiniObjectParams
  extends util.Params<schemas.ZodMiniObject, "shape"> {}
export function object<T extends schemas.ZodMiniRawShape>(
  shape: T,
  params?: ZodMiniObjectParams
): schemas.ZodMiniObject<T> {
  const def: schemas.ZodMiniObjectDef = {
    type: "object",
    shape,
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodMiniObject(def) as schemas.ZodMiniObject<T>;
}

// strictObject
interface ZodMiniStrictObjectParams
  extends util.Params<schemas.ZodMiniObject, "shape" | "catchall"> {}
export function strictObject<T extends schemas.ZodMiniRawShape>(
  shape: T,
  params?: ZodMiniStrictObjectParams
): schemas.ZodMiniObject<T> {
  const def: schemas.ZodMiniObjectDef = {
    type: "object",
    shape,
    catchall: never(),
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodMiniObject(def) as schemas.ZodMiniObject<T>;
}

// looseObject
interface ZodMiniLooseObjectParams
  extends util.Params<schemas.ZodMiniObject, "shape" | "catchall"> {}
export function looseObject<T extends schemas.ZodMiniRawShape>(
  shape: T,
  params?: ZodMiniLooseObjectParams
): schemas.ZodMiniObject<T> {
  const def: schemas.ZodMiniObjectDef = {
    type: "object",
    shape,
    catchall: unknown(),
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodMiniObject(def) as schemas.ZodMiniObject<T>;
}

// .keyof
export function keyof<T extends schemas.ZodMiniObject>(
  schema: T
): schemas.ZodMiniEnum<Array<keyof T["_def"]["shape"]>> {
  return _enum(Object.keys(schema._def.shape)) as any;
}

// .extend
export function extend<
  T extends schemas.ZodMiniObject,
  U extends schemas.ZodMiniRawShape,
>(schema: T, shape: U): schemas.ZodMiniObject<T["_def"]["shape"] & U> {
  return schema._clone({
    ...schema._def,
    shape: { ...schema._def.shape, ...shape },
    checks: [],
  }) as any;
}

// .merge
export function merge<
  T extends schemas.ZodMiniObject,
  U extends schemas.ZodMiniObject,
>(
  base: T,
  incoming: U
): schemas.ZodMiniObject<T["_def"]["shape"] & U["_def"]["shape"]> {
  return incoming._clone({
    ...incoming._def, // incoming overrides properties on base
    shape: { ...base._def.shape, ...incoming._def.shape },
    checks: [],
  });
}

// .pick
type Mask<Keys extends PropertyKey> = { [K in Keys]?: true };
export function pick<
  T extends schemas.ZodMiniObject,
  M extends core.Exactly<Mask<keyof T["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.ZodMiniObject<Pick<T["shape"], Extract<keyof T["shape"], keyof M>>> {
  const shape: any = {};
  for (const key in mask) {
    shape[key] = schema._def.shape[key];
  }
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// .omit
export function omit<
  T extends schemas.ZodMiniObject,
  M extends core.Exactly<Mask<keyof T["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.ZodMiniObject<Omit<T["shape"], Extract<keyof T["shape"], keyof M>>> {
  const shape: schemas.ZodMiniRawShape = { ...schema.shape };
  for (const key in mask) delete shape[key];
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// .partial
export function partial<T extends schemas.ZodMiniObject>(
  schema: T
): schemas.ZodMiniObject<{
  [k in keyof T["shape"]]: schemas.ZodMiniOptional<T["shape"][k]>;
}> {
  const shape: schemas.ZodMiniRawShape = {};
  for (const key in schema._def.shape) {
    shape[key] = optional(schema._def.shape[key]);
  }
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// .required

// union
interface ZodMiniUnionParams
  extends util.Params<schemas.ZodMiniUnion, "options"> {}
export function union<T extends schemas.ZodMiniType[]>(
  options: T,
  params?: ZodMiniUnionParams
): schemas.ZodMiniUnion<T> {
  return new schemas.ZodMiniUnion({
    type: "union",
    options,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniUnion<T>;
}

// or
// export const or: typeof union = union;

// discriminatedUnion
interface ZodMiniDiscriminatedUnionParams
  extends util.Params<schemas.ZodMiniDiscriminatedUnion, "options"> {}
export function discriminatedUnion<
  Types extends [schemas.ZodMiniObject, ...schemas.ZodMiniObject[]],
>(
  options: Types,
  params?: ZodMiniDiscriminatedUnionParams
): schemas.ZodMiniDiscriminatedUnion<Types> {
  return new schemas.ZodMiniDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniDiscriminatedUnion<Types>;
}

// intersection
interface ZodMiniIntersectionParams
  extends util.Params<schemas.ZodMiniIntersection, "left" | "right"> {}
export function intersection<
  T extends schemas.ZodMiniType,
  U extends schemas.ZodMiniType,
>(
  left: T,
  right: U,
  params?: ZodMiniIntersectionParams
): schemas.ZodMiniIntersection<T, U> {
  return new schemas.ZodMiniIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniIntersection<T, U>;
}

// and
// export const and: typeof intersection = intersection;

// tuple
interface ZodMiniTupleParams
  extends util.Params<schemas.ZodMiniTuple, "items"> {
  rest?: schemas.ZodMiniTuple["_def"]["rest"];
}
export function tuple<
  T extends [schemas.ZodMiniType, ...schemas.ZodMiniType[]],
>(items: T, params?: ZodMiniTupleParams): schemas.ZodMiniTuple<T> {
  return new schemas.ZodMiniTuple({
    type: "tuple",
    items,
    rest: params?.rest ?? null,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniTuple<T>;
}

// record
interface ZodMiniRecordParams
  extends util.Params<schemas.ZodMiniRecord, "keySchema" | "valueSchema"> {}
export function record<
  Key extends schemas.ZodMiniHasValues,
  Value extends schemas.ZodMiniType,
>(
  keySchema: Key,
  valueSchema: Value,
  params?: ZodMiniRecordParams
): schemas.ZodMiniRecord<Key, Value> {
  return new schemas.ZodMiniRecord({
    type: "record",
    keySchema,
    valueSchema,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniRecord<Key, Value>;
}

// map
interface ZodMiniMapParams
  extends util.Params<schemas.ZodMiniMap, "keyType" | "valueType"> {}
export function map<
  Key extends schemas.ZodMiniType,
  Value extends schemas.ZodMiniType,
>(
  keyType: Key,
  valueType: Value,
  params?: ZodMiniMapParams
): schemas.ZodMiniMap<Key, Value> {
  return new schemas.ZodMiniMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniMap<Key, Value>;
}

// set
interface ZodMiniSetParams
  extends util.Params<schemas.ZodMiniSet, "valueType"> {}
export function set<Value extends schemas.ZodMiniType>(
  valueType: Value,
  params?: ZodMiniSetParams
): schemas.ZodMiniSet<Value> {
  return new schemas.ZodMiniSet({
    type: "set",
    valueType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniSet<Value>;
}

// enum
interface ZodMiniEnumParams
  extends util.Params<schemas.ZodMiniEnum, "values"> {}
function _enum<T extends string[]>(
  values: T,
  params?: ZodMiniEnumParams
): schemas.ZodMiniEnum<T> {
  return new schemas.ZodMiniEnum({
    type: "enum",
    values: values.map((value) => ({ key: value, value })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodMiniEnum<T>;
}
export { _enum as enum };

// nativeEnum
interface ZodMiniNativeEnumParams
  extends util.Params<schemas.ZodMiniNativeEnum> {}
export function nativeEnum<T extends core.$EnumLike>(
  values: T,
  params?: ZodMiniNativeEnumParams
): schemas.ZodMiniNativeEnum<T> {
  return new schemas.ZodMiniNativeEnum({
    type: "enum",
    values: Object.entries(values).map(([key, value]) => ({ key, value })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodMiniNativeEnum<T>;
}

// literal
interface ZodMiniLiteralParams
  extends util.Params<schemas.ZodMiniLiteral, "values"> {}
export function literal<T extends core.Primitive | core.Primitive[]>(
  value: T,
  params?: ZodMiniLiteralParams
): schemas.ZodMiniLiteral<T extends core.Primitive ? [T] : T> {
  return new schemas.ZodMiniLiteral({
    type: "enum",
    values: (Array.isArray(value) ? value : [value]).map((v) => ({ value: v })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodMiniLiteral<T extends core.Primitive ? [T] : T>;
}

// envbool
// interface ZodMiniEnvBoolParams
//   extends util.Params<schemas.ZodMiniSuccess, "innerType">,
//     util.Params<schemas.ZodMiniEnum, "values"> {
//   error?:
//     | string
//     | core.$ZodErrorMap<core.$ZodIssueEnumInvalidValue>
//     | undefined;
// }

// export function envbool<T extends string[]>(
//   values: T = ["true"],
//   params?: ZodMiniEnvBoolParams
// ): schemas.ZodMiniSuccess<schemas.ZodMiniEnum<T>> {
//   return any()._refine;
// }

// file
interface ZodMiniFileParams extends util.Params<schemas.ZodMiniFile> {}
export const file: util.PrimitiveFactory<
  ZodMiniFileParams,
  schemas.ZodMiniFile
> = util.factory(schemas.ZodMiniFile, { type: "file" });

// effect
interface ZodMiniEffectParams
  extends util.Params<schemas.ZodMiniEffect, "effect"> {}
export function effect<O = unknown, I = unknown>(
  effect: (input: I, ctx?: core.$ParseContext) => O,
  params?: ZodMiniEffectParams
): schemas.ZodMiniEffect<O, I> {
  return new schemas.ZodMiniEffect({
    type: "effect",
    effect: effect as any,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniEffect<O, I>;
}

// preprocess
interface ZodMiniPreprocessParams
  extends ZodMiniEffectParams,
    ZodMiniPipelineParams {}
export function preprocess<T extends schemas.ZodMiniType>(
  _effect: (arg: unknown) => core.input<T>,
  schema: T,
  params?: ZodMiniPreprocessParams
): schemas.ZodMiniPipeline<schemas.ZodMiniEffect<T["_input"], unknown>, T> {
  return pipeline(effect(_effect, params), schema, params);
}
// interface ZodMiniPreprocessParams
//   extends util.Params<schemas.ZodMiniPreprocess, "effect"> {}
// export function preprocess<T extends schemas.ZodMiniType>(
//   schema: T,
//   effect: (arg: unknown) => core.input<T>,
//   params?: ZodMiniPreprocessParams
// ): schemas.ZodMiniPreprocess<T> {
//   return new schemas.ZodMiniPreprocess({
//     type: "preprocess",
//     schema,
//     effect,
//     ...util.normalizeCreateParams(params),
//   }) as schemas.ZodMiniPreprocess<T>;
// }

// transform
// rewrite to use pipeline and effect
interface ZodMiniTransformParams
  extends ZodMiniEffectParams,
    ZodMiniPipelineParams {}
export function transform<T extends schemas.ZodMiniType, NewOut>(
  schema: T,
  _effect: (arg: core.output<T>) => NewOut,
  params?: ZodMiniTransformParams
): schemas.ZodMiniPipeline<T, schemas.ZodMiniEffect<NewOut, core.output<T>>> {
  return pipeline(schema, effect(_effect, params), params);
}
// interface ZodMiniTransformParams
//   extends util.Params<schemas.ZodMiniTransform, "schema" | "effect"> {}
// export function transform<T extends schemas.ZodMiniType, NewOut>(
//   schema: T,
//   effect: (arg: core.output<T>) => NewOut,
//   params?: ZodMiniTransformParams
// ): schemas.ZodMiniTransform<T> {
//   return new schemas.ZodMiniTransform({
//     type: "transform",
//     schema,
//     effect,
//     ...util.normalizeCreateParams(params),
//   }) as schemas.ZodMiniTransform<T>;
// }

// optional
interface ZodMiniOptionalParams
  extends util.Params<schemas.ZodMiniOptional, "innerType"> {}
export function optional<T extends schemas.ZodMiniType>(
  innerType: T,
  params?: ZodMiniOptionalParams
): schemas.ZodMiniOptional<T> {
  return new schemas.ZodMiniOptional({
    type: "optional",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniOptional<T>;
}

// nullable
interface ZodMiniNullableParams
  extends util.Params<schemas.ZodMiniNullable, "innerType"> {}
export function nullable<T extends schemas.ZodMiniType>(
  innerType: T,
  params?: ZodMiniNullableParams
): schemas.ZodMiniNullable<T> {
  return new schemas.ZodMiniNullable({
    type: "nullable",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniNullable<T>;
}

// success
interface ZodMiniSuccessParams
  extends util.Params<schemas.ZodMiniSuccess, "innerType"> {}
export function success<T extends schemas.ZodMiniType>(
  innerType: T,
  params?: ZodMiniSuccessParams
): schemas.ZodMiniSuccess<T> {
  return new schemas.ZodMiniSuccess({
    type: "success",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniSuccess<T>;
}

// default
interface ZodMiniDefaultParams
  extends util.Params<schemas.ZodMiniDefault, "innerType"> {}
function _default<T extends schemas.ZodMiniType>(
  innerType: T,
  defaultValue: core.output<T> | (() => core.output<T>),
  params?: ZodMiniDefaultParams
): schemas.ZodMiniDefault<T> {
  return new schemas.ZodMiniDefault({
    type: "default",
    innerType,
    defaultValue:
      defaultValue instanceof Function ? defaultValue : () => defaultValue,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniDefault<T>;
}
export { _default as default };

// catch
interface ZodMiniCatchParams
  extends util.Params<schemas.ZodMiniCatch, "innerType"> {}
function _catch<T extends schemas.ZodMiniType>(
  innerType: T,
  catchValue: core.output<T> | (() => core.output<T>),
  params?: ZodMiniCatchParams
): schemas.ZodMiniCatch<T> {
  return new schemas.ZodMiniCatch({
    type: "catch",
    innerType,
    catchValue: catchValue instanceof Function ? catchValue : () => catchValue,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniCatch<T>;
}
export { _catch as catch };

// nan
interface ZodMiniNaNParams extends util.Params<schemas.ZodMiniNaN> {}
export const nan: util.PrimitiveFactory<ZodMiniNaNParams, schemas.ZodMiniNaN> =
  util.factory(schemas.ZodMiniNaN, { type: "nan" });

// pipeline
interface ZodMiniPipelineParams
  extends util.Params<schemas.ZodMiniPipeline, "in" | "out"> {}
export function pipeline<
  T extends schemas.ZodMiniType,
  U extends schemas.ZodMiniType,
>(
  in_: T,
  out: U,
  params?: ZodMiniPipelineParams
): schemas.ZodMiniPipeline<T, U> {
  return new schemas.ZodMiniPipeline({
    type: "pipeline",
    in: in_,
    out,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniPipeline<T, U>;
}

// readonly
interface ZodMiniReadonlyParams
  extends util.Params<schemas.ZodMiniReadonly, "innerType"> {}
export function readonly<T extends schemas.ZodMiniType>(
  innerType: T,
  params?: ZodMiniReadonlyParams
): schemas.ZodMiniReadonly<T> {
  return new schemas.ZodMiniReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMiniReadonly<T>;
}

// templateLiteral
interface ZodMiniTemplateLiteralParams
  extends util.Params<schemas.ZodMiniTemplateLiteral, "parts"> {}
export function templateLiteral<
  const Parts extends core.$TemplateLiteralPart[],
>(
  parts: Parts,
  params?: ZodMiniTemplateLiteralParams
): schemas.ZodMiniTemplateLiteral<core.$PartsToTemplateLiteral<Parts>> {
  return new schemas.ZodMiniTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeCreateParams(params),
  }) as any;
}

// custom
interface CustomParams
  extends Omit<
    core.$ZodIssueData<core.$ZodIssueCustom>,
    "code" | "origin" | "input"
  > {}
export type ZodCustom<T> = schemas.ZodMiniType<T, T>;
export function custom<T>(
  check?: (data: unknown) => unknown,
  _params: string | CustomParams = {}
): ZodCustom<T> {
  let result = new schemas.ZodMiniAny({
    type: "any",
  });

  const params: CustomParams =
    typeof _params === "string" ? { message: _params } : _params;

  if (check)
    result = result._refine({
      _def: { check: "custom" },
      run(ctx) {
        if (!check(ctx.input)) {
          ctx.addIssue({
            input: ctx.input,
            code: "custom",
            origin: "custom",
            level: "error",
            ...params,
          });
        }
      },
    });
  return result;
}

// instanceof
abstract class Class {
  constructor(..._: any[]) {}
}
function _instanceof<T extends typeof Class>(
  cls: T,
  params: CustomParams = {
    message: `Input not instance of ${cls.name}`,
  }
): ZodCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}
export { _instanceof as instanceof };

// refine
export function refine<T>(
  refinement: (arg: T) => unknown | Promise<unknown>,
  params: string | CustomParams = {}
): core.$ZodCheck<T> {
  const _params: CustomParams =
    typeof params === "string" ? { message: params } : params;
  return {
    _def: { check: "custom" },
    run(ctx) {
      if (!refinement(ctx.input)) {
        ctx.addIssue({
          input: ctx.input,
          code: "custom",
          origin: "custom",
          level: "error",
          ..._params,
        });
      }
    },
  };
}
