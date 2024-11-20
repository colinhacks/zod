import * as core from "zod-core";
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

export * as coerce from "./coerce.js";

interface ZodStringParams extends util.Params<schemas.ZodString, "coerce"> {}
export const string: util.PrimitiveFactory<ZodStringParams, schemas.ZodString> =
  util.factory(schemas.ZodString, {
    type: "string",
  });

// ZodUUID
interface ZodUUIDParams extends util.Params<schemas.ZodUUID, "coerce"> {}
export const uuid: util.PrimitiveFactory<ZodUUIDParams, schemas.ZodUUID> =
  util.factory(schemas.ZodUUID, {
    type: "string",
    format: "uuid",
    check: "string_format",
  });

// ZodEmail
interface ZodEmailParams extends util.Params<schemas.ZodEmail, "coerce"> {}
export const email: util.PrimitiveFactory<ZodEmailParams, schemas.ZodEmail> =
  util.factory(schemas.ZodEmail, {
    type: "string",
    format: "email",
    check: "string_format",
  });

// ZodURL
interface ZodURLParams extends util.Params<schemas.ZodURL, "coerce"> {}
export const url: util.PrimitiveFactory<ZodURLParams, schemas.ZodURL> =
  util.factory(schemas.ZodURL, {
    type: "string",
    format: "url",
    check: "string_format",
  });

// ZodEmoji
interface ZodEmojiParams extends util.Params<schemas.ZodEmoji, "coerce"> {}
export const emoji: util.PrimitiveFactory<ZodEmojiParams, schemas.ZodEmoji> =
  util.factory(schemas.ZodEmoji, {
    type: "string",
    format: "emoji",
    check: "string_format",
  });

// ZodNanoID
interface ZodNanoIDParams extends util.Params<schemas.ZodNanoID, "coerce"> {}
export const nanoid: util.PrimitiveFactory<ZodNanoIDParams, schemas.ZodNanoID> =
  util.factory(schemas.ZodNanoID, {
    type: "string",
    format: "nanoid",
    check: "string_format",
  });

// ZodCUID
interface ZodCUIDParams extends util.Params<schemas.ZodCUID, "coerce"> {}
export const cuid: util.PrimitiveFactory<ZodCUIDParams, schemas.ZodCUID> =
  util.factory(schemas.ZodCUID, {
    type: "string",
    format: "cuid",
    check: "string_format",
  });

// ZodCUID2
interface ZodCUID2Params extends util.Params<schemas.ZodCUID2, "coerce"> {}
export const cuid2: util.PrimitiveFactory<ZodCUID2Params, schemas.ZodCUID2> =
  util.factory(schemas.ZodCUID2, {
    type: "string",
    format: "cuid2",
    check: "string_format",
  });

// ZodULID
interface ZodULIDParams extends util.Params<schemas.ZodULID, "coerce"> {}
export const ulid: util.PrimitiveFactory<ZodULIDParams, schemas.ZodULID> =
  util.factory(schemas.ZodULID, {
    type: "string",
    format: "ulid",
    check: "string_format",
  });

// ZodXID
interface ZodXIDParams extends util.Params<schemas.ZodXID, "coerce"> {}
export const xid: util.PrimitiveFactory<ZodXIDParams, schemas.ZodXID> =
  util.factory(schemas.ZodXID, {
    type: "string",
    format: "xid",
    check: "string_format",
  });

// ZodKSUID
interface ZodKSUIDParams extends util.Params<schemas.ZodKSUID, "coerce"> {}
export const ksuid: util.PrimitiveFactory<ZodKSUIDParams, schemas.ZodKSUID> =
  util.factory(schemas.ZodKSUID, {
    type: "string",
    format: "ksuid",
    check: "string_format",
  });

// ZodDuration
interface ZodDurationParams
  extends util.Params<schemas.ZodDuration, "coerce"> {}
export const duration: util.PrimitiveFactory<
  ZodDurationParams,
  schemas.ZodDuration
> = util.factory(schemas.ZodDuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});

// ZodIP
interface ZodIPParams extends util.Params<schemas.ZodIP, "coerce"> {}
export const ip: util.PrimitiveFactory<ZodIPParams, schemas.ZodIP> =
  util.factory(schemas.ZodIP, {
    type: "string",
    format: "ip",
    check: "string_format",
  });

// ZodIPv4
interface ZodIPv4Params extends util.Params<schemas.ZodIPv4, "coerce"> {}
export const ipv4: util.PrimitiveFactory<ZodIPv4Params, schemas.ZodIPv4> =
  util.factory(schemas.ZodIPv4, {
    type: "string",
    format: "ipv4",
    check: "string_format",
  });

// ZodIPv6
interface ZodIPv6Params extends util.Params<schemas.ZodIPv6, "coerce"> {}
export const ipv6: util.PrimitiveFactory<ZodIPv6Params, schemas.ZodIPv6> =
  util.factory(schemas.ZodIPv6, {
    type: "string",
    format: "ipv6",
    check: "string_format",
  });

// ZodBase64
interface ZodBase64Params extends util.Params<schemas.ZodBase64, "coerce"> {}
export const base64: util.PrimitiveFactory<ZodBase64Params, schemas.ZodBase64> =
  util.factory(schemas.ZodBase64, {
    type: "string",
    format: "base64",
    check: "string_format",
  });

// ZodJSONString
interface ZodJSONStringParams
  extends util.Params<schemas.ZodJSONString, "coerce"> {}
export const jsonString: util.PrimitiveFactory<
  ZodJSONStringParams,
  schemas.ZodJSONString
> = util.factory(schemas.ZodJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
});

// ZodE164
interface ZodE164Params extends util.Params<schemas.ZodE164, "coerce"> {}
export const e164: util.PrimitiveFactory<ZodE164Params, schemas.ZodE164> =
  util.factory(schemas.ZodE164, {
    type: "string",
    format: "e164",
    check: "string_format",
  });

// ZodJWT
interface ZodJWTParams extends util.Params<schemas.ZodJWT, "coerce"> {
  algorithm?: schemas.ZodJWT["_def"]["algorithm"];
}
export const jwt: util.PrimitiveFactory<ZodJWTParams, schemas.ZodJWT> =
  util.factory(schemas.ZodJWT, {
    type: "string",
    format: "jwt",
    check: "string_format",
  });

// number
interface ZodNumberParams
  extends util.Params<schemas.ZodNumber, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<ZodNumberParams, schemas.ZodNumber> =
  util.factory(schemas.ZodNumberFast, { type: "number" });

// int
interface ZodIntParams extends ZodNumberParams {}
export const int: util.PrimitiveFactory<ZodIntParams, schemas.ZodNumber> =
  util.factory(schemas.ZodNumber, { type: "number", format: "safeint" });

// float32
interface ZodFloat32Params extends ZodNumberParams {}
export const float32: util.PrimitiveFactory<
  ZodFloat32Params,
  schemas.ZodNumber
> = util.factory(schemas.ZodNumber, { type: "number", format: "float32" });

// float64
interface ZodFloat64Params extends ZodNumberParams {}
export const float64: util.PrimitiveFactory<
  ZodFloat64Params,
  schemas.ZodNumber
> = util.factory(schemas.ZodNumber, { type: "number", format: "float64" });

// int32
interface ZodInt32Params extends ZodNumberParams {}
export const int32: util.PrimitiveFactory<ZodInt32Params, schemas.ZodNumber> =
  util.factory(schemas.ZodNumber, { type: "number", format: "int32" });

// uint32
interface ZodUInt32Params extends ZodNumberParams {}
export const uint32: util.PrimitiveFactory<ZodUInt32Params, schemas.ZodNumber> =
  util.factory(schemas.ZodNumber, { type: "number", format: "uint32" });

// int64
interface ZodInt64Params extends ZodNumberParams {}
export const int64: util.PrimitiveFactory<ZodInt64Params, schemas.ZodNumber> =
  util.factory(schemas.ZodNumber, { type: "number", format: "int64" });

// uint64
interface ZodUInt64Params extends ZodNumberParams {}
export const uint64: util.PrimitiveFactory<ZodUInt64Params, schemas.ZodNumber> =
  util.factory(schemas.ZodNumber, { type: "number", format: "uint64" });

// boolean
interface ZodBooleanParams extends util.Params<schemas.ZodBoolean> {}
export const boolean: util.PrimitiveFactory<
  ZodBooleanParams,
  schemas.ZodBoolean
> = util.factory(schemas.ZodBoolean, { type: "boolean" });

// bigint
interface ZodBigIntParams extends util.Params<schemas.ZodBigInt> {}
export const bigint: util.PrimitiveFactory<ZodBigIntParams, schemas.ZodBigInt> =
  util.factory(schemas.ZodBigInt, { type: "bigint" });

// symbol
interface ZodSymbolParams extends util.Params<schemas.ZodSymbol> {}
export const symbol: util.PrimitiveFactory<ZodSymbolParams, schemas.ZodSymbol> =
  util.factory(schemas.ZodSymbol, { type: "symbol" });

// date
interface ZodDateParams extends util.Params<schemas.ZodDate> {}
export const date: util.PrimitiveFactory<ZodDateParams, schemas.ZodDate> =
  util.factory(schemas.ZodDate, { type: "date" });

// undefined
interface ZodUndefinedParams extends util.Params<schemas.ZodUndefined> {}
const _undefined: util.PrimitiveFactory<
  ZodUndefinedParams,
  schemas.ZodUndefined
> = util.factory(schemas.ZodUndefined, { type: "undefined" });

export { _undefined as undefined };

// null
interface ZodNullParams extends util.Params<schemas.ZodNull> {}
export const _null: util.PrimitiveFactory<ZodNullParams, schemas.ZodNull> =
  util.factory(schemas.ZodNull, { type: "null" });
export { _null as null };

// any
interface ZodAnyParams extends util.Params<schemas.ZodAny> {}
export const any: util.PrimitiveFactory<ZodAnyParams, schemas.ZodAny> =
  util.factory(schemas.ZodAny, { type: "any" });

// unknown
interface ZodUnknownParams extends util.Params<schemas.ZodUnknown> {}
export const unknown: util.PrimitiveFactory<
  ZodUnknownParams,
  schemas.ZodUnknown
> = util.factory(schemas.ZodUnknown, { type: "unknown" });

// never
interface ZodNeverParams extends util.Params<schemas.ZodNever> {}
export const never: util.PrimitiveFactory<ZodNeverParams, schemas.ZodNever> =
  util.factory(schemas.ZodNever, { type: "never" });

// void
interface ZodVoidParams extends util.Params<schemas.ZodVoid> {}
export const _void: util.PrimitiveFactory<ZodVoidParams, schemas.ZodVoid> =
  util.factory(schemas.ZodVoid, { type: "void" });
export { _void as void };

// array
interface ZodArrayParams extends util.Params<schemas.ZodArray, "element"> {}
export function array<T extends schemas.ZodType>(
  element: T,
  params?: ZodArrayParams
): schemas.ZodArray<T> {
  return new schemas.ZodArray({
    type: "array",
    element,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodArray<T>;
}

// object
interface ZodObjectParams extends util.Params<schemas.ZodObject, "shape"> {}
export function object<T extends schemas.ZodRawShape>(
  shape: T,
  params?: ZodObjectParams
): schemas.ZodObject<T> {
  const def: schemas.ZodObjectDef = {
    type: "object",
    shape,
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodObject(def) as schemas.ZodObject<T>;
}

// strictObject
interface ZodStrictObjectParams
  extends util.Params<schemas.ZodObject, "shape" | "catchall"> {}
export function strictObject<T extends schemas.ZodRawShape>(
  shape: T,
  params?: ZodStrictObjectParams
): schemas.ZodObject<T> {
  const def: schemas.ZodObjectDef = {
    type: "object",
    shape,
    catchall: never(),
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodObject(def) as schemas.ZodObject<T>;
}

// looseObject
interface ZodLooseObjectParams
  extends util.Params<schemas.ZodObject, "shape" | "catchall"> {}
export function looseObject<T extends schemas.ZodRawShape>(
  shape: T,
  params?: ZodLooseObjectParams
): schemas.ZodObject<T> {
  const def: schemas.ZodObjectDef = {
    type: "object",
    shape,
    catchall: unknown(),
    ...util.normalizeCreateParams(params),
  };
  return new schemas.ZodObject(def) as schemas.ZodObject<T>;
}

// .keyof
export function keyof<T extends schemas.ZodObject>(
  schema: T
): schemas.ZodEnum<Array<keyof T["_def"]["shape"]>> {
  return _enum(Object.keys(schema._def.shape)) as any;
}

// .extend
export function extend<
  T extends schemas.ZodObject,
  U extends schemas.ZodRawShape,
>(schema: T, shape: U): schemas.ZodObject<T["_def"]["shape"] & U> {
  return schema._clone({
    ...schema._def,
    shape: { ...schema._def.shape, ...shape },
    checks: [],
  }) as any;
}

// .merge
export function merge<T extends schemas.ZodObject, U extends schemas.ZodObject>(
  base: T,
  incoming: U
): schemas.ZodObject<T["_def"]["shape"] & U["_def"]["shape"]> {
  return incoming._clone({
    ...incoming._def, // incoming overrides properties on base
    shape: { ...base._def.shape, ...incoming._def.shape },
    checks: [],
  });
}

// .pick
type Mask<Keys extends PropertyKey> = { [K in Keys]?: true };
export function pick<
  T extends schemas.ZodObject,
  M extends core.Exactly<Mask<keyof T["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.ZodObject<Pick<T["shape"], Extract<keyof T["shape"], keyof M>>> {
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
  T extends schemas.ZodObject,
  M extends core.Exactly<Mask<keyof T["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.ZodObject<Omit<T["shape"], Extract<keyof T["shape"], keyof M>>> {
  const shape: schemas.ZodRawShape = { ...schema.shape };
  for (const key in mask) delete shape[key];
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// .partial
export function partial<T extends schemas.ZodObject>(
  schema: T
): schemas.ZodObject<{
  [k in keyof T["shape"]]: schemas.ZodOptional<T["shape"][k]>;
}> {
  const shape: schemas.ZodRawShape = {};
  for (const key in schema._def.shape) {
    shape[key] = optional(schema._def.shape[key]);
  }
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// union
interface ZodUnionParams extends util.Params<schemas.ZodUnion, "options"> {}
export function union<T extends schemas.ZodType[]>(
  options: T,
  params?: ZodUnionParams
): schemas.ZodUnion<T> {
  return new schemas.ZodUnion({
    type: "union",
    options,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodUnion<T>;
}

// or
// export const or: typeof union = union;

// discriminatedUnion

interface ZodDiscriminatedUnionParams
  extends util.Params<schemas.ZodDiscriminatedUnion, "options"> {}
export function discriminatedUnion<
  Types extends [schemas.ZodHasDiscriminator, ...schemas.ZodHasDiscriminator[]],
>(
  options: Types,
  params?: ZodDiscriminatedUnionParams
): schemas.ZodDiscriminatedUnion<Types> {
  return new schemas.ZodDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodDiscriminatedUnion<Types>;
}

// intersection
interface ZodIntersectionParams
  extends util.Params<schemas.ZodIntersection, "left" | "right"> {}
export function intersection<
  T extends schemas.ZodType,
  U extends schemas.ZodType,
>(
  left: T,
  right: U,
  params?: ZodIntersectionParams
): schemas.ZodIntersection<T, U> {
  return new schemas.ZodIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodIntersection<T, U>;
}

// and
// export const and: typeof intersection = intersection;

// tuple
interface ZodTupleParams extends util.Params<schemas.ZodTuple, "items"> {
  // rest?: schemas.ZodTuple["_def"]["rest"];
}

export function tuple<T extends [schemas.ZodType, ...schemas.ZodType[]]>(
  items: T,
  params?: ZodTupleParams
): schemas.ZodTuple<T, null>;
export function tuple<
  T extends [schemas.ZodType, ...schemas.ZodType[]],
  Rest extends schemas.ZodType,
>(items: T, rest: Rest, params?: ZodTupleParams): schemas.ZodTuple<T, Rest>;
export function tuple(
  items: schemas.ZodType[],
  _paramsOrRest?: ZodTupleParams | schemas.ZodType,
  _params?: ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof schemas.ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new schemas.ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util.normalizeCreateParams(params),
  });
}

// record
interface ZodRecordParams
  extends util.Params<schemas.ZodRecord, "keySchema" | "valueSchema"> {}
export function record<
  Key extends schemas.ZodPropertyKey,
  Value extends schemas.ZodType,
>(
  keySchema: Key,
  valueSchema: Value,
  params?: ZodRecordParams
): schemas.ZodRecord<Key, Value> {
  return new schemas.ZodRecord({
    type: "record",
    keySchema,
    valueSchema,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodRecord<Key, Value>;
}

// map
interface ZodMapParams
  extends util.Params<schemas.ZodMap, "keyType" | "valueType"> {}
export function map<Key extends schemas.ZodType, Value extends schemas.ZodType>(
  keyType: Key,
  valueType: Value,
  params?: ZodMapParams
): schemas.ZodMap<Key, Value> {
  return new schemas.ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodMap<Key, Value>;
}

// set
interface ZodSetParams extends util.Params<schemas.ZodSet, "valueType"> {}
export function set<Value extends schemas.ZodType>(
  valueType: Value,
  params?: ZodSetParams
): schemas.ZodSet<Value> {
  return new schemas.ZodSet({
    type: "set",
    valueType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodSet<Value>;
}

// enum
interface ZodEnumParams extends util.Params<schemas.ZodEnum, "entries"> {}
function _enum<const T extends string[]>(
  values: T,
  params?: ZodEnumParams
): schemas.ZodEnum<T> {
  return new schemas.ZodEnum({
    type: "enum",
    entries: values.map((value) => ({ key: value, value })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodEnum<T>;
}
export { _enum as enum };

// nativeEnum
interface ZodNativeEnumParams
  extends util.Params<schemas.ZodNativeEnum, "entries"> {}
export function nativeEnum<T extends core.$EnumLike>(
  values: T,
  params?: ZodNativeEnumParams
): schemas.ZodNativeEnum<T> {
  return new schemas.ZodNativeEnum({
    type: "enum",
    entries: Object.entries(values).map(([key, value]) => ({ key, value })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodNativeEnum<T>;
}

// literal
interface ZodLiteralParams extends util.Params<schemas.ZodLiteral, "entries"> {}
export function literal<const T extends core.$EnumValue | core.$EnumValue[]>(
  value: T,
  params?: ZodLiteralParams
): schemas.ZodLiteral<T extends core.$EnumValue[] ? T : [T]> {
  return new schemas.ZodLiteral({
    type: "enum",
    entries: (Array.isArray(value) ? value : [value]).map((v) => ({
      value: v,
    })),
    ...util.normalizeCreateParams(params),
  }) as any as schemas.ZodLiteral<T extends core.$EnumValue[] ? T : [T]>;
}

// envbool
// interface ZodEnvBoolParams
//   extends util.Params<schemas.ZodSuccess, "innerType">,
//     util.Params<schemas.ZodEnum, "values"> {
//   error?:
//     | string
//     | core.$ZodErrorMap<core.$ZodIssueEnumInvalidValue>
//     | undefined;
// }

// export function envbool<T extends string[]>(
//   values: T = ["true"],
//   params?: ZodEnvBoolParams
// ): schemas.ZodSuccess<schemas.ZodEnum<T>> {
//   return any()._refine;
// }

// file
interface ZodFileParams extends util.Params<schemas.ZodFile> {}
export const file: util.PrimitiveFactory<ZodFileParams, schemas.ZodFile> =
  util.factory(schemas.ZodFile, { type: "file" });

// effect
interface ZodEffectParams extends util.Params<schemas.ZodEffect, "effect"> {}
export function effect<O = unknown, I = unknown>(
  effect: (input: I, ctx?: core.$ParseContext) => O,
  params?: ZodEffectParams
): schemas.ZodEffect<O, I> {
  return new schemas.ZodEffect({
    type: "effect",
    effect: effect as any,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodEffect<O, I>;
}

// preprocess
interface ZodPreprocessParams extends ZodEffectParams, ZodPipelineParams {}
export function preprocess<T extends schemas.ZodType>(
  _effect: (arg: unknown) => core.input<T>,
  schema: T,
  params?: ZodPreprocessParams
): schemas.ZodPipeline<schemas.ZodEffect<T["_input"], unknown>, T> {
  return pipeline(effect(_effect, params), schema, params);
}
// interface ZodPreprocessParams
//   extends util.Params<schemas.ZodPreprocess, "effect"> {}
// export function preprocess<T extends schemas.ZodType>(
//   schema: T,
//   effect: (arg: unknown) => core.input<T>,
//   params?: ZodPreprocessParams
// ): schemas.ZodPreprocess<T> {
//   return new schemas.ZodPreprocess({
//     type: "preprocess",
//     schema,
//     effect,
//     ...util.normalizeCreateParams(params),
//   }) as schemas.ZodPreprocess<T>;
// }

// transform
// rewrite to use pipeline and effect
interface ZodTransformParams extends ZodEffectParams, ZodPipelineParams {}
export function transform<T extends schemas.ZodType, NewOut>(
  schema: T,
  _effect: (arg: core.output<T>) => NewOut,
  params?: ZodTransformParams
): schemas.ZodPipeline<T, schemas.ZodEffect<Awaited<NewOut>, core.output<T>>> {
  return pipeline(schema, effect(_effect, params), params) as any;
}
// interface ZodTransformParams
//   extends util.Params<schemas.ZodTransform, "schema" | "effect"> {}
// export function transform<T extends schemas.ZodType, NewOut>(
//   schema: T,
//   effect: (arg: core.output<T>) => NewOut,
//   params?: ZodTransformParams
// ): schemas.ZodTransform<T> {
//   return new schemas.ZodTransform({
//     type: "transform",
//     schema,
//     effect,
//     ...util.normalizeCreateParams(params),
//   }) as schemas.ZodTransform<T>;
// }

// optional
export interface ZodOptionalParams
  extends util.Params<schemas.ZodOptional, "innerType"> {}
export function optional<T extends schemas.ZodType>(
  innerType: T,
  params?: ZodOptionalParams
): schemas.ZodOptional<T> {
  return new schemas.ZodOptional({
    type: "optional",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodOptional<T>;
}

// nullable
interface ZodNullableParams
  extends util.Params<schemas.ZodNullable, "innerType"> {}
export function nullable<T extends schemas.ZodType>(
  innerType: T,
  params?: ZodNullableParams
): schemas.ZodNullable<T> {
  return new schemas.ZodNullable({
    type: "nullable",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodNullable<T>;
}

// success
interface ZodSuccessParams
  extends util.Params<schemas.ZodSuccess, "innerType"> {}
export function success<T extends schemas.ZodType>(
  innerType: T,
  params?: ZodSuccessParams
): schemas.ZodSuccess<T> {
  return new schemas.ZodSuccess({
    type: "success",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodSuccess<T>;
}

// default
interface ZodDefaultParams
  extends util.Params<schemas.ZodDefault, "innerType"> {}
function _default<T extends schemas.ZodType>(
  innerType: T,
  defaultValue: core.output<T> | (() => core.output<T>),
  params?: ZodDefaultParams
): schemas.ZodDefault<T> {
  return new schemas.ZodDefault({
    type: "default",
    innerType,
    defaultValue:
      defaultValue instanceof Function ? defaultValue : () => defaultValue,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodDefault<T>;
}
export { _default };

// catch
interface ZodCatchParams extends util.Params<schemas.ZodCatch, "innerType"> {}
function _catch<T extends schemas.ZodType>(
  innerType: T,
  catchValue: core.output<T> | (() => core.output<T>),
  params?: ZodCatchParams
): schemas.ZodCatch<T> {
  return new schemas.ZodCatch({
    type: "catch",
    innerType,
    catchValue: catchValue instanceof Function ? catchValue : () => catchValue,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodCatch<T>;
}
export { _catch as catch };

// nan
interface ZodNaNParams extends util.Params<schemas.ZodNaN> {}
export const nan: util.PrimitiveFactory<ZodNaNParams, schemas.ZodNaN> =
  util.factory(schemas.ZodNaN, { type: "nan" });

// pipeline
interface ZodPipelineParams
  extends util.Params<schemas.ZodPipeline, "in" | "out"> {}
export function pipeline<
  T extends schemas.ZodType,
  U extends schemas.ZodType<any, T["_output"]>,
>(
  in_: T,
  // fn: (arg: core.output<T>) => core.input<U>,
  out: U,
  params?: ZodPipelineParams
): schemas.ZodPipeline<T, U> {
  return new schemas.ZodPipeline({
    type: "pipeline",
    in: in_,
    out,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodPipeline<T, U>;
}

// readonly
interface ZodReadonlyParams
  extends util.Params<schemas.ZodReadonly, "innerType"> {}
export function readonly<T extends schemas.ZodType>(
  innerType: T,
  params?: ZodReadonlyParams
): schemas.ZodReadonly<T> {
  return new schemas.ZodReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeCreateParams(params),
  }) as schemas.ZodReadonly<T>;
}

// templateLiteral
interface ZodTemplateLiteralParams
  extends util.Params<schemas.ZodTemplateLiteral, "parts"> {}
export function templateLiteral<
  const Parts extends core.$TemplateLiteralPart[],
>(
  parts: Parts,
  params?: ZodTemplateLiteralParams
): schemas.ZodTemplateLiteral<core.$PartsToTemplateLiteral<Parts>> {
  return new schemas.ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeCreateParams(params),
  }) as any;
}

// custom
// type lkjasdf = core.$ZodIssueCustom[''];
// interface CustomParams
//   extends Omit<
//     core.$ZodIssueData<core.$ZodIssueCustom>,
//     "code" | "origin" | "input"
//   > {}

interface CustomParams extends util.RawCheckParams {
  error?: string | core.$ZodErrorMap<core.$ZodIssueCustom>;
  path?: PropertyKey[];
}
export type ZodCustom<T> = schemas.ZodType<T, T>;
export function custom<T>(
  fn?: (data: unknown) => unknown,
  _params: string | CustomParams = {}
): ZodCustom<T> {
  let result = new schemas.ZodAny({
    type: "any",
  });

  const params = util.normalizeCheckParams(_params);

  if (fn)
    result = result._check({
      _def: { check: "custom" },
      run(input) {
        if (!fn(input)) {
          return {
            issues: [
              {
                input,
                code: "custom",
                origin: "custom",
                level: "error",
                def: params,
                path: params?.path,
              },
            ],
          };
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
    error: `Input not instance of ${cls.name}`,
  }
): ZodCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}
export { _instanceof as instanceof };

// refine
function customErr(
  err: Pick<core.$ZodIssueData<core.$ZodIssueCustom>, "input" | "path" | "def">
): { issues: core.$ZodIssueData[] } {
  return {
    issues: [
      {
        code: "custom",
        origin: "custom",
        ...err,
      }, // as core.$ZodIssueData<core.$ZodIssueCustom>,
    ],
  };
}

export function refine<T>(
  fn: (arg: T) => unknown | Promise<unknown>,
  _params: string | CustomParams = {}
): core.$ZodCheck<T> {
  const params = util.normalizeCheckParams(_params as util.RawCheckParams);
  return {
    _def: { check: "custom", error: params.error },
    run(input: T) {
      const res = fn(input);
      if (res instanceof Promise)
        return res.then((r) =>
          r ? undefined : customErr({ input, def: params, path: params.path })
        );
      return res
        ? undefined
        : customErr({ input, def: params, path: params.path });
    },
  };
}

///////////        METHODS       ///////////

/**
 * parse(data: unknown, params?: core.$ParseContext): Output;
 */
export function parse<T extends schemas.ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): core.output<T> {
  const result = schema._parse(data, ctx);
  if (result instanceof Promise) {
    throw new Error(
      "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
    );
  }
  if (core.$failed(result)) throw core.$finalize(result.issues, ctx);
  return result as core.output<T>;
}

/**
 * safeParse(
  data: unknown,
  params?: core.$ParseContext
): SafeParseResult<Output>;
 */
type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: core.$ZodFailure };
export function safeParse<T extends schemas.ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): SafeParseResult<core.output<T>> {
  const result = schema._parse(data, ctx);
  if (result instanceof Promise)
    throw new Error(
      "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
    );
  return (
    core.$succeeded(result)
      ? { success: true, data: result }
      : { success: false, error: result }
  ) as SafeParseResult<core.output<T>>;
}

/**
 * parseAsync(
  data: unknown,
  params?: core.$ParseContext
): Promise<Output>;
 */
export async function parseAsync<T extends schemas.ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): Promise<core.output<T>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  if (core.$succeeded(result)) return result as core.output<T>;
  throw result;
}

/**
 * safeParseAsync(
  data: unknown,
  params?: core.$ParseContext
): Promise<SafeParseResult<Output>>;
 */
export async function safeParseAsync<T extends schemas.ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): Promise<SafeParseResult<core.output<T>>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  return (
    core.$succeeded(result)
      ? { success: true, data: result }
      : { success: false, error: result }
  ) as SafeParseResult<core.output<T>>;
}
