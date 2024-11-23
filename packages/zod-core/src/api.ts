import * as base from "./base.js";
import * as checks from "./checks.js";
import type * as errors from "./errors.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";

export * as iso from "./iso.js";
export * as coerce from "./coerce.js";
export * from "./checks.js";

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

//////   API   //////

interface $ZodStringParams
  extends util.TypeParams<schemas.$ZodString<string>, "coerce"> {}
export const string: util.PrimitiveFactory<
  $ZodStringParams,
  schemas.$ZodString<string>
> = util.factory(schemas.$ZodString, {
  type: "string",
}) as any;

// $ZodGUID
interface $ZodGUIDParams
  extends util.StringFormatParams<schemas.$ZodGUID, "coerce"> {}
export const guid: util.PrimitiveFactory<$ZodGUIDParams, schemas.$ZodGUID> =
  util.factory(schemas.$ZodGUID, {
    type: "string",
    format: "guid",
    check: "string_format",
  });

// $ZodUUID
interface $ZodUUIDParams
  extends util.StringFormatParams<schemas.$ZodUUID, "coerce" | "pattern"> {}
export const uuid: util.PrimitiveFactory<$ZodUUIDParams, schemas.$ZodUUID> =
  util.factory(schemas.$ZodUUID, {
    type: "string",
    format: "uuid",
    check: "string_format",
  });

export const uuidv4: util.PrimitiveFactory<$ZodUUIDParams, schemas.$ZodUUID> =
  util.factory(schemas.$ZodUUID, {
    type: "string",
    format: "uuid",
    check: "string_format",
    version: 4,
  });

export const uuidv6: util.PrimitiveFactory<$ZodUUIDParams, schemas.$ZodUUID> =
  util.factory(schemas.$ZodUUID, {
    type: "string",
    format: "uuid",
    check: "string_format",
    version: 6,
  });

export const uuidv7: util.PrimitiveFactory<$ZodUUIDParams, schemas.$ZodUUID> =
  util.factory(schemas.$ZodUUID, {
    type: "string",
    format: "uuid",
    check: "string_format",
    version: 7,
  });

// $ZodEmail
interface $ZodEmailParams
  extends util.StringFormatParams<schemas.$ZodEmail, "coerce"> {}
interface EmailFactory
  extends util.PrimitiveFactory<$ZodEmailParams, schemas.$ZodEmail> {}
export const email: EmailFactory = util.factory(schemas.$ZodEmail, {
  type: "string",
  format: "email",
  check: "string_format",
});

// $ZodURL
interface $ZodURLParams
  extends util.StringFormatParams<schemas.$ZodURL, "coerce"> {}
export const url: util.PrimitiveFactory<$ZodURLParams, schemas.$ZodURL> =
  util.factory(schemas.$ZodURL, {
    type: "string",
    format: "url",
    check: "string_format",
  });

// $ZodEmoji
interface $ZodEmojiParams
  extends util.StringFormatParams<schemas.$ZodEmoji, "coerce"> {}
export const emoji: util.PrimitiveFactory<$ZodEmojiParams, schemas.$ZodEmoji> =
  util.factory(schemas.$ZodEmoji, {
    type: "string",
    format: "emoji",
    check: "string_format",
  });

// $ZodNanoID
interface $ZodNanoIDParams
  extends util.StringFormatParams<schemas.$ZodNanoID, "coerce"> {}
export const nanoid: util.PrimitiveFactory<
  $ZodNanoIDParams,
  schemas.$ZodNanoID
> = util.factory(schemas.$ZodNanoID, {
  type: "string",
  format: "nanoid",
  check: "string_format",
});

// $ZodCUID
interface $ZodCUIDParams
  extends util.StringFormatParams<schemas.$ZodCUID, "coerce"> {}
export const cuid: util.PrimitiveFactory<$ZodCUIDParams, schemas.$ZodCUID> =
  util.factory(schemas.$ZodCUID, {
    type: "string",
    format: "cuid",
    check: "string_format",
  });

// $ZodCUID2
interface $ZodCUID2Params
  extends util.StringFormatParams<schemas.$ZodCUID2, "coerce"> {}
export const cuid2: util.PrimitiveFactory<$ZodCUID2Params, schemas.$ZodCUID2> =
  util.factory(schemas.$ZodCUID2, {
    type: "string",
    format: "cuid2",
    check: "string_format",
  });

// $ZodULID
interface $ZodULIDParams
  extends util.StringFormatParams<schemas.$ZodULID, "coerce"> {}
export const ulid: util.PrimitiveFactory<$ZodULIDParams, schemas.$ZodULID> =
  util.factory(schemas.$ZodULID, {
    type: "string",
    format: "ulid",
    check: "string_format",
  });

// $ZodXID
interface $ZodXIDParams
  extends util.StringFormatParams<schemas.$ZodXID, "coerce"> {}
export const xid: util.PrimitiveFactory<$ZodXIDParams, schemas.$ZodXID> =
  util.factory(schemas.$ZodXID, {
    type: "string",
    format: "xid",
    check: "string_format",
  });

// $ZodKSUID
interface $ZodKSUIDParams
  extends util.StringFormatParams<schemas.$ZodKSUID, "coerce"> {}
export const ksuid: util.PrimitiveFactory<$ZodKSUIDParams, schemas.$ZodKSUID> =
  util.factory(schemas.$ZodKSUID, {
    type: "string",
    format: "ksuid",
    check: "string_format",
  });

// $ZodIP
interface $ZodIPParams
  extends util.StringFormatParams<schemas.$ZodIP, "coerce"> {}
export const ip: util.PrimitiveFactory<$ZodIPParams, schemas.$ZodIP> =
  util.factory(schemas.$ZodIP, {
    type: "string",
    format: "ip",
    check: "string_format",
  });

// $ZodIPv4
interface $ZodIPv4Params
  extends util.StringFormatParams<schemas.$ZodIPv4, "coerce"> {}
export const ipv4: util.PrimitiveFactory<$ZodIPv4Params, schemas.$ZodIPv4> =
  util.factory(schemas.$ZodIPv4, {
    type: "string",
    format: "ipv4",
    check: "string_format",
  });

// $ZodIPv6
interface $ZodIPv6Params
  extends util.StringFormatParams<schemas.$ZodIPv6, "coerce"> {}
export const ipv6: util.PrimitiveFactory<$ZodIPv6Params, schemas.$ZodIPv6> =
  util.factory(schemas.$ZodIPv6, {
    type: "string",
    format: "ipv6",
    check: "string_format",
  });

// $ZodBase64
interface $ZodBase64Params
  extends util.StringFormatParams<schemas.$ZodBase64, "coerce"> {}
export const base64: util.PrimitiveFactory<
  $ZodBase64Params,
  schemas.$ZodBase64
> = util.factory(schemas.$ZodBase64, {
  type: "string",
  format: "base64",
  check: "string_format",
});

// $ZodJSONString
interface $ZodJSONStringParams
  extends util.StringFormatParams<schemas.$ZodJSONString, "coerce"> {}
export const jsonString: util.PrimitiveFactory<
  $ZodJSONStringParams,
  schemas.$ZodJSONString
> = util.factory(schemas.$ZodJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
});

// $ZodE164
interface $ZodE164Params
  extends util.StringFormatParams<schemas.$ZodE164, "coerce"> {}
export const e164: util.PrimitiveFactory<$ZodE164Params, schemas.$ZodE164> =
  util.factory(schemas.$ZodE164, {
    type: "string",
    format: "e164",
    check: "string_format",
  });

// $ZodJWT
interface $ZodJWTParams
  extends util.StringFormatParams<schemas.$ZodJWT, "coerce"> {
  algorithm?: schemas.$ZodJWT["_def"]["algorithm"];
}
export const jwt: util.PrimitiveFactory<$ZodJWTParams, schemas.$ZodJWT> =
  util.factory(schemas.$ZodJWT, {
    type: "string",
    format: "jwt",
    check: "string_format",
  });

// number
interface $ZodNumberParams
  extends util.TypeParams<schemas.$ZodNumber<number>, "format" | "coerce"> {}
export const number: util.PrimitiveFactory<
  $ZodNumberParams,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumberFast, { type: "number" }) as any;

// int
interface $ZodIntParams extends $ZodNumberParams {}
export const int: util.PrimitiveFactory<
  $ZodIntParams,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "safeint",
}) as any;

// float32
interface $ZodFloat32Params extends $ZodNumberParams {}
export const float32: util.PrimitiveFactory<
  $ZodFloat32Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "float32",
}) as any;

// float64
interface $ZodFloat64Params extends $ZodNumberParams {}
export const float64: util.PrimitiveFactory<
  $ZodFloat64Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "float64",
}) as any;

// int32
interface $ZodInt32Params extends $ZodNumberParams {}
export const int32: util.PrimitiveFactory<
  $ZodInt32Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "int32",
}) as any;

// uint32
interface $ZodUInt32Params extends $ZodNumberParams {}
export const uint32: util.PrimitiveFactory<
  $ZodUInt32Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "uint32",
}) as any;

// int64
interface $ZodInt64Params extends $ZodNumberParams {}
export const int64: util.PrimitiveFactory<
  $ZodInt64Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "int64",
}) as any;

// uint64
interface $ZodUInt64Params extends $ZodNumberParams {}
export const uint64: util.PrimitiveFactory<
  $ZodUInt64Params,
  schemas.$ZodNumber<number>
> = util.factory(schemas.$ZodNumber, {
  type: "number",
  format: "uint64",
}) as any;

// boolean
interface $ZodBooleanParams
  extends util.TypeParams<schemas.$ZodBoolean<boolean>> {}
export const boolean: util.PrimitiveFactory<
  $ZodBooleanParams,
  schemas.$ZodBoolean<boolean>
> = util.factory(schemas.$ZodBoolean, { type: "boolean" }) as any;

// bigint
interface $ZodBigIntParams
  extends util.TypeParams<schemas.$ZodBigInt<bigint>> {}
export const bigint: util.PrimitiveFactory<
  $ZodBigIntParams,
  schemas.$ZodBigInt<bigint>
> = util.factory(schemas.$ZodBigInt, { type: "bigint" }) as any;

// symbol
interface $ZodSymbolParams
  extends util.TypeParams<schemas.$ZodSymbol<symbol>> {}
export const symbol: util.PrimitiveFactory<
  $ZodSymbolParams,
  schemas.$ZodSymbol<symbol>
> = util.factory(schemas.$ZodSymbol, { type: "symbol" }) as any;

// date
interface $ZodDateParams extends util.TypeParams<schemas.$ZodDate> {}
export const date: util.PrimitiveFactory<$ZodDateParams, schemas.$ZodDate> =
  util.factory(schemas.$ZodDate, { type: "date" });

// undefined
interface $ZodUndefinedParams extends util.TypeParams<schemas.$ZodUndefined> {}
const _undefined: util.PrimitiveFactory<
  $ZodUndefinedParams,
  schemas.$ZodUndefined
> = util.factory(schemas.$ZodUndefined, { type: "undefined" });

export { _undefined as undefined };

// null
interface $ZodNullParams extends util.TypeParams<schemas.$ZodNull> {}
export const _null: util.PrimitiveFactory<$ZodNullParams, schemas.$ZodNull> =
  util.factory(schemas.$ZodNull, { type: "null" });
export { _null as null };

// any
interface $ZodAnyParams extends util.TypeParams<schemas.$ZodAny> {}
export const any: util.PrimitiveFactory<$ZodAnyParams, schemas.$ZodAny> =
  util.factory(schemas.$ZodAny, { type: "any" });

// unknown
interface $ZodUnknownParams extends util.TypeParams<schemas.$ZodUnknown> {}
export const unknown: util.PrimitiveFactory<
  $ZodUnknownParams,
  schemas.$ZodUnknown
> = util.factory(schemas.$ZodUnknown, { type: "unknown" });

// never
interface $ZodNeverParams extends util.TypeParams<schemas.$ZodNever> {}
export const never: util.PrimitiveFactory<$ZodNeverParams, schemas.$ZodNever> =
  util.factory(schemas.$ZodNever, { type: "never" });

// void
interface $ZodVoidParams extends util.TypeParams<schemas.$ZodVoid> {}
export const _void: util.PrimitiveFactory<$ZodVoidParams, schemas.$ZodVoid> =
  util.factory(schemas.$ZodVoid, { type: "void" });
export { _void as void };

// array
interface $ZodArrayParams
  extends util.TypeParams<schemas.$ZodArray, "element"> {}
export function array<T extends base.$ZodType>(
  element: T,
  params?: $ZodArrayParams
): schemas.$ZodArray<T> {
  return new schemas.$ZodArray({
    type: "array",
    element,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodArray<T>;
}

// object
interface $ZodObjectParams
  extends util.TypeParams<schemas.$ZodObject, "shape"> {}
export function object<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as any;
}

// type OptionalKeys<T extends PropertyKey> = T extends `${string}?` ? T : never;
// type RequiredKeys<T extends PropertyKey> = Exclude<T, `${string}?`>;

// // type lkjdf = OptionalKeys<{ "a?": string }>;
// type ShapeWithQuestionMarks<T extends schemas.$ZodRawShape> = util.Flatten<
//   {
//     [K in RequiredKeys<keyof T>]: T[K];
//   } & {
//     [K in OptionalKeys<keyof T> as K extends `${infer K}?` ? K : never]?: T[K];
//   }
// >;

// type $optional = { _qout: "true"; _qin: "true" };
// type ShapeWithQuestionMarks<T extends schemas.$ZodRawShape> = util.Flatten<{
//   [k in keyof T as k extends `${infer NewK}?`
//     ? NewK
//     : k]: k extends `${string}?` ? T[k] & $optional : T[k];
// }>;
// type asdf = Exclude<{ a?: string | undefined }, { a?: undefined }>;
// interface $NewZodObjectParams extends util.TypeParams<schemas.$ZodObject, "shape"> {}
// export function newobject<T extends schemas.$ZodRawShape>(
//   shape: T,
//   params?: $NewZodObjectParams
// ): schemas.$ZodObject<ShapeWithQuestionMarks<T>> {
//   const def: schemas.$ZodObjectDef = {
//     type: "object",
//     shape,
//     ...util.normalizeTypeParams(params),
//   };
//   return new schemas.$ZodObject(def) as schemas.$ZodObject<
//     ShapeWithQuestionMarks<T>
//   >;
// }

// strictObject
interface $ZodStrictObjectParams
  extends util.TypeParams<schemas.$ZodObject, "shape" | "catchall"> {}
export function strictObject<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodStrictObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    catchall: never(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
}

// looseObject
interface $ZodLooseObjectParams
  extends util.TypeParams<schemas.$ZodObject, "shape" | "catchall"> {}
export function looseObject<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodLooseObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    catchall: unknown(),
    ...util.normalizeTypeParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
}

// .keyof
export function keyof<T extends schemas.$ZodObject>(
  schema: T
): schemas.$ZodEnum<util.KeyOf<T["_def"]["shape"]>> {
  return _enum(Object.keys(schema._def.shape)) as any;
}

// .extend
export function extend<
  T extends schemas.$ZodObject,
  U extends schemas.$ZodRawShape,
>(schema: T, shape: U): schemas.$ZodObject<T["_def"]["shape"] & U> {
  return schema._clone({
    ...schema._def,
    shape: { ...schema._def.shape, ...shape },
    checks: [],
  }) as any;
}

// .merge
export function merge<
  T extends schemas.$ZodObject,
  U extends schemas.$ZodObject,
>(
  base: T,
  incoming: U
): schemas.$ZodObject<T["_def"]["shape"] & U["_def"]["shape"]> {
  return incoming._clone({
    ...incoming._def, // incoming overrides properties on base
    shape: { ...base._def.shape, ...incoming._def.shape },
    checks: [],
  });
}

// .pick
type Mask<Keys extends PropertyKey> = { [K in Keys]?: true };
export function pick<
  T extends schemas.$ZodObject,
  M extends util.Exactly<Mask<keyof T["_def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.$ZodObject<
  Pick<T["_def"]["shape"], Extract<keyof T["_def"]["shape"], keyof M>>
> {
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
  T extends schemas.$ZodObject,
  M extends util.Exactly<Mask<keyof T["_def"]["shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.$ZodObject<
  Omit<T["_def"]["shape"], Extract<keyof T["_def"]["shape"], keyof M>>
> {
  const shape: schemas.$ZodRawShape = { ...schema._def.shape };
  for (const key in mask) delete shape[key];
  return schema._clone({
    ...schema._def,
    shape,
    checks: [],
  }) as any;
}

// .partial
export function partial<T extends schemas.$ZodObject>(
  schema: T
): schemas.$ZodObject<{
  [k in keyof T["_def"]["shape"]]: schemas.$ZodOptional<T["_def"]["shape"][k]>;
}> {
  const shape: schemas.$ZodRawShape = {};
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
interface $ZodUnionParams
  extends util.TypeParams<schemas.$ZodUnion, "options"> {}
export function union<const T extends base.$ZodType[]>(
  options: T,
  params?: $ZodUnionParams
): schemas.$ZodUnion<T> {
  return new schemas.$ZodUnion({
    type: "union",
    options,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodUnion<T>;
}

// or
// export const or: typeof union = union;

// discriminatedUnion
export interface $ZodHasDiscriminator extends base.$ZodType {
  _disc: base.$DiscriminatorMap;
}
interface $ZodDiscriminatedUnionParams
  extends util.TypeParams<schemas.$ZodDiscriminatedUnion, "options"> {}
export function discriminatedUnion<
  Types extends [$ZodHasDiscriminator, ...$ZodHasDiscriminator[]],
>(
  options: Types,
  params?: $ZodDiscriminatedUnionParams
): schemas.$ZodDiscriminatedUnion<Types> {
  return new schemas.$ZodDiscriminatedUnion({
    type: "union",
    options,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodDiscriminatedUnion<Types>;
}

// intersection
interface $ZodIntersectionParams
  extends util.TypeParams<schemas.$ZodIntersection, "left" | "right"> {}
export function intersection<T extends base.$ZodType, U extends base.$ZodType>(
  left: T,
  right: U,
  params?: $ZodIntersectionParams
): schemas.$ZodIntersection<T, U> {
  return new schemas.$ZodIntersection({
    type: "intersection",
    left,
    right,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodIntersection<T, U>;
}

// and
// export const and: typeof intersection = intersection;

// tuple
interface $ZodTupleParams extends util.TypeParams<schemas.$ZodTuple, "items"> {
  // rest?: schemas.$ZodTuple["_def"]["rest"];
}

export function tuple<T extends [base.$ZodType, ...base.$ZodType[]]>(
  items: T,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, null>;
export function tuple<
  T extends [base.$ZodType, ...base.$ZodType[]],
  Rest extends base.$ZodType,
>(items: T, rest: Rest, params?: $ZodTupleParams): schemas.$ZodTuple<T, Rest>;
export function tuple(
  items: base.$ZodType[],
  _paramsOrRest?: $ZodTupleParams | base.$ZodType,
  _params?: $ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof base.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new schemas.$ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util.normalizeTypeParams(params),
  });
}

// record
interface $ZodRecordParams
  extends util.TypeParams<schemas.$ZodRecord, "keySchema" | "valueSchema"> {}
export function record<
  Key extends schemas.$ZodPropertyKey,
  Value extends base.$ZodType,
>(
  keySchema: Key,
  valueSchema: Value,
  params?: $ZodRecordParams
): schemas.$ZodRecord<Key, Value> {
  return new schemas.$ZodRecord({
    type: "record",
    keySchema,
    valueSchema,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodRecord<Key, Value>;
}

// map
interface $ZodMapParams
  extends util.TypeParams<schemas.$ZodMap, "keyType" | "valueType"> {}
export function map<Key extends base.$ZodType, Value extends base.$ZodType>(
  keyType: Key,
  valueType: Value,
  params?: $ZodMapParams
): schemas.$ZodMap<Key, Value> {
  return new schemas.$ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodMap<Key, Value>;
}

// set
interface $ZodSetParams extends util.TypeParams<schemas.$ZodSet, "valueType"> {}
export function set<Value extends base.$ZodType>(
  valueType: Value,
  params?: $ZodSetParams
): schemas.$ZodSet<Value> {
  return new schemas.$ZodSet({
    type: "set",
    valueType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodSet<Value>;
}

// enum
interface $ZodEnumParams extends util.TypeParams<schemas.$ZodEnum, "entries"> {}
function _enum<const T extends string[]>(
  values: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<util.ToEnum<T[number]>> {
  const entries: util.EnumLike = {};
  for (const val of values) {
    entries[val] = val;
  }

  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodEnum<util.ToEnum<T[number]>>;
}
export { _enum as enum };

// nativeEnum
// interface $ZodNativeEnumParams
//   extends util.TypeParams<schemas.$ZodNativeEnum, "entries"> {}
export function nativeEnum<T extends util.EnumLike>(
  entries: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<T> {
  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...util.normalizeTypeParams(params),
  }) as any as schemas.$ZodEnum<T>;
}

// literal
interface $ZodLiteralParams
  extends util.TypeParams<schemas.$ZodLiteral, "literals"> {}
export function literal<const T extends util.Literal | util.Literal[]>(
  value: T,
  params?: $ZodLiteralParams
): schemas.$ZodLiteral<T extends util.Literal ? [T] : T> {
  return new schemas.$ZodLiteral({
    type: "enum",
    literals: Array.isArray(value) ? value : [value],
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodLiteral<T extends util.Literal ? [T] : T>;
}

// envbool
// interface $ZodEnvBoolParams
//   extends util.TypeParams<schemas.$ZodSuccess, "innerType">,
//     util.TypeParams<schemas.$ZodEnum, "values"> {
//   error?:
//     | string
//     | errors.$ZodErrorMap<errors.$ZodIssueEnumInvalidValue>
//     | undefined;
// }

// export function envbool<T extends string[]>(
//   values: T = ["true"],
//   params?: $ZodEnvBoolParams
// ): schemas.$ZodSuccess<schemas.$ZodEnum<T>> {
//   return any()._refine;
// }

// file
interface $ZodFileParams extends util.TypeParams<schemas.$ZodFile> {}
export const file: util.PrimitiveFactory<$ZodFileParams, schemas.$ZodFile> =
  util.factory(schemas.$ZodFile, { type: "file" });

// effect
interface $ZodEffectParams
  extends util.TypeParams<schemas.$ZodEffect, "effect"> {}
export function effect<O = unknown, I = unknown>(
  effect: (input: I, ctx?: base.$ParseContext) => O,
  params?: $ZodEffectParams
): schemas.$ZodEffect<O, I> {
  return new schemas.$ZodEffect({
    type: "effect",
    effect: effect as any,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodEffect<O, I>;
}

// preprocess
interface $ZodPreprocessParams extends $ZodEffectParams, $ZodPipelineParams {}
export function preprocess<T, U extends base.$ZodType<unknown, T>>(
  _effect: (arg: unknown) => T,
  schema: U,
  params?: $ZodPreprocessParams
): schemas.$ZodPipeline<schemas.$ZodEffect<T, unknown>, U> {
  return pipeline(effect(_effect, params), schema, params);
}
// interface $ZodPreprocessParams
//   extends util.TypeParams<schemas.$ZodPreprocess, "effect"> {}
// export function preprocess<T extends base.$ZodType>(
//   schema: T,
//   effect: (arg: unknown) => base.input<T>,
//   params?: $ZodPreprocessParams
// ): schemas.$ZodPreprocess<T> {
//   return new schemas.$ZodPreprocess({
//     type: "preprocess",
//     schema,
//     effect,
//     ...util.normalizeTypeParams(params),
//   }) as schemas.$ZodPreprocess<T>;
// }

// transform
// rewrite to use pipeline and effect
interface $ZodTransformParams extends $ZodEffectParams, $ZodPipelineParams {}
export function transform<T extends base.$ZodType, NewOut>(
  schema: T,
  _effect: (arg: base.output<T>) => NewOut,
  params?: $ZodTransformParams
): schemas.$ZodPipeline<
  T,
  schemas.$ZodEffect<Awaited<NewOut>, base.output<T>>
> {
  return pipeline(schema, effect(_effect, params), params) as any;
}
// interface $ZodTransformParams
//   extends util.TypeParams<schemas.$ZodTransform, "schema" | "effect"> {}
// export function transform<T extends base.$ZodType, NewOut>(
//   schema: T,
//   effect: (arg: base.output<T>) => NewOut,
//   params?: $ZodTransformParams
// ): schemas.$ZodTransform<T> {
//   return new schemas.$ZodTransform({
//     type: "transform",
//     schema,
//     effect,
//     ...util.normalizeTypeParams(params),
//   }) as schemas.$ZodTransform<T>;
// }

// optional
interface $ZodOptionalParams
  extends util.TypeParams<schemas.$ZodOptional, "innerType"> {}
export function optional<T extends base.$ZodType>(
  innerType: T,
  params?: $ZodOptionalParams
): schemas.$ZodOptional<T> {
  return new schemas.$ZodOptional({
    type: "optional",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodOptional<T>;
}

// nullable
interface $ZodNullableParams
  extends util.TypeParams<schemas.$ZodNullable, "innerType"> {}
export function nullable<T extends base.$ZodType>(
  innerType: T,
  params?: $ZodNullableParams
): schemas.$ZodNullable<T> {
  return new schemas.$ZodNullable({
    type: "nullable",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodNullable<T>;
}

// success
interface $ZodSuccessParams
  extends util.TypeParams<schemas.$ZodSuccess, "innerType"> {}
export function success<T extends base.$ZodType>(
  innerType: T,
  params?: $ZodSuccessParams
): schemas.$ZodSuccess<T> {
  return new schemas.$ZodSuccess({
    type: "success",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodSuccess<T>;
}

// default
interface $ZodDefaultParams
  extends util.TypeParams<schemas.$ZodDefault, "innerType"> {}
function _default<T extends base.$ZodType>(
  innerType: T,
  defaultValue: base.output<T> | (() => base.output<T>),
  params?: $ZodDefaultParams
): schemas.$ZodDefault<T> {
  return new schemas.$ZodDefault({
    type: "default",
    innerType,
    defaultValue:
      defaultValue instanceof Function ? defaultValue : () => defaultValue,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodDefault<T>;
}
export { _default };

// catch
interface $ZodCatchParams
  extends util.TypeParams<schemas.$ZodCatch, "innerType"> {}
function _catch<T extends base.$ZodType>(
  innerType: T,
  catchValue: base.output<T> | (() => base.output<T>),
  params?: $ZodCatchParams
): schemas.$ZodCatch<T> {
  return new schemas.$ZodCatch({
    type: "catch",
    innerType,
    catchValue: catchValue instanceof Function ? catchValue : () => catchValue,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodCatch<T>;
}
export { _catch as catch };

// nan
interface $ZodNaNParams extends util.TypeParams<schemas.$ZodNaN> {}
export const nan: util.PrimitiveFactory<$ZodNaNParams, schemas.$ZodNaN> =
  util.factory(schemas.$ZodNaN, { type: "nan" });

// pipeline
interface $ZodPipelineParams
  extends util.TypeParams<schemas.$ZodPipeline, "in" | "out"> {}
export function pipeline<
  T extends base.$ZodType,
  U extends base.$ZodType<any, T["_output"]>,
>(
  in_: T,
  // fn: (arg: base.output<T>) => base.input<U>,
  out: U,
  params?: $ZodPipelineParams
): schemas.$ZodPipeline<T, U> {
  return new schemas.$ZodPipeline({
    type: "pipeline",
    in: in_,
    out,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodPipeline<T, U>;
}

// readonly
interface $ZodReadonlyParams
  extends util.TypeParams<schemas.$ZodReadonly, "innerType"> {}
export function readonly<T extends base.$ZodType>(
  innerType: T,
  params?: $ZodReadonlyParams
): schemas.$ZodReadonly<T> {
  return new schemas.$ZodReadonly({
    type: "readonly",
    innerType,
    ...util.normalizeTypeParams(params),
  }) as schemas.$ZodReadonly<T>;
}

// templateLiteral
interface $ZodTemplateLiteralParams
  extends util.TypeParams<schemas.$ZodTemplateLiteral, "parts"> {}
export function templateLiteral<
  const Parts extends schemas.$TemplateLiteralPart[],
>(
  parts: Parts,
  params?: $ZodTemplateLiteralParams
): schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>> {
  return new schemas.$ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util.normalizeTypeParams(params),
  }) as any;
}

// custom
// type lkjasdf = errors.$ZodIssueCustom[''];
// interface CustomParams
//   extends Omit<
//     errors.$ZodIssueData<errors.$ZodIssueCustom>,
//     "code" | "origin" | "input"
//   > {}

interface CustomParams extends util.CheckParams {
  error?: string | errors.$ZodErrorMap<errors.$ZodIssueCustom>;
  path?: PropertyKey[];
}
export type $ZodCustom<T> = base.$ZodType<T, T>;
export function custom<T>(
  fn?: (data: unknown) => unknown,
  _params: string | CustomParams = {}
): $ZodCustom<T> {
  let result = new schemas.$ZodAny({
    type: "any",
  });

  const params = util.normalizeCheckParams(_params);

  if (fn)
    result = result._check({
      _def: { check: "custom" },
      run2(ctx) {
        if (!fn(ctx.value)) {
          ctx.issues.push({
            input: ctx.value,
            code: "custom",
            origin: "custom",
            level: "error",
            def: params,
            path: params?.path,
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
    error: `Input not instance of ${cls.name}`,
  }
): $ZodCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}
export { _instanceof as instanceof };

// refine
function customIssue(
  err: Pick<
    errors.$ZodIssueData<errors.$ZodIssueCustom>,
    "input" | "path" | "def" | "message"
  >
): errors.$ZodIssueData {
  return {
    code: "custom",
    origin: "custom",
    ...err,
  };
}

function handleRefineResult(
  result: unknown,
  final: base.$ZodResultFull,
  input: unknown,
  def: util.NormalizedCheckParams,
  path: PropertyKey[] = []
): void | Promise<void> {
  if (!result) {
    final.issues.push(customIssue({ input, def, path }));
  }
}

export function refine<T>(
  fn: (arg: T) => unknown | Promise<unknown>,
  _params: string | CustomParams = {}
): base.$ZodCheck<T> {
  const params = util.normalizeCheckParams(_params as util.CheckParams);
  return {
    _def: { check: "custom", error: params.error },
    run2(ctx) {
      const result = fn(ctx.value);
      if (result instanceof Promise)
        return result.then((result) => {
          handleRefineResult(result, ctx, ctx.value, params);
        });

      return handleRefineResult(result, ctx, ctx.value, params);
    },
  };
}

export function superRefine<T>(
  fn: (arg: T, ctx: util.RefinementCtx) => void | Promise<void>
): base.$ZodCheck<T> {
  return {
    _def: { check: "custom" },
    run2(ctx) {
      const result = fn(ctx.value, {
        addIssue(issue) {
          if (typeof issue === "string") {
            ctx.issues.push(
              customIssue({
                input: ctx.value,
                message: issue,
                def: undefined,
              })
            );
          } else ctx.issues.push(issue);
        },
      });
      return result;
    },
  };
}

///////////        METHODS       ///////////

export function parse<T extends base.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: base.$ParseContext
): base.output<T> {
  const result = schema._parse(data, ctx);
  if (result instanceof Promise) {
    throw new Error(
      "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
    );
  }

  if (result.issues?.length) {
    throw base.$finalize(result.issues!, ctx);
  }
  return result.value as base.output<T>;
}

export function safeParse<T extends base.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: base.$ParseContext
): util.SafeParseResult<base.output<T>> {
  const result = schema._parse(data, ctx);
  if (result instanceof Promise)
    throw new Error(
      "Encountered Promise during synchronous .parse(). Use .parseAsync() instead."
    );
  return (
    base.$failed(result)
      ? { success: false, error: base.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<base.output<T>>;
}

export async function parseAsync<T extends base.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: base.$ParseContext
): Promise<base.output<T>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  if (base.$failed(result)) throw base.$finalize(result.issues);
  return result.value as base.output<T>;
}

export async function safeParseAsync<T extends base.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: base.$ParseContext
): Promise<util.SafeParseResult<base.output<T>>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  return (
    base.$failed(result)
      ? { success: false, error: base.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as util.SafeParseResult<base.output<T>>;
}

////////    CHECKS   ////////
export function lt<T extends util.Numeric>(
  value: T,
  params?: string | util.CheckParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function lte(
  value: util.Numeric,
  params?: string | util.CheckParams
): checks.$ZodCheckLessThan<util.Numeric> {
  return new checks.$ZodCheckLessThan({
    check: "less_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}

export function gt(
  value: util.Numeric,
  params?: string | util.CheckParams
): checks.$ZodCheckGreaterThan {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: false,
  });
}

export function gte<T extends util.Numeric>(
  value: T,
  params?: string | util.CheckParams
): checks.$ZodCheckGreaterThan<T> {
  return new checks.$ZodCheckGreaterThan({
    check: "greater_than",
    ...util.normalizeCheckParams(params),
    value,
    inclusive: true,
  });
}

export function maxSize(
  maximum: number,
  params?: string | util.CheckParams
): checks.$ZodCheckMaxSize<util.Sizeable> {
  return new checks.$ZodCheckMaxSize({
    check: "max_size",
    ...util.normalizeCheckParams(params),
    maximum,
  });
}

export function minSize(
  minimum: number,
  params?: string | util.CheckParams
): checks.$ZodCheckMinSize<util.Sizeable> {
  return new checks.$ZodCheckMinSize({
    check: "min_size",
    ...util.normalizeCheckParams(params),
    minimum,
  });
}

export function size(
  size: number,
  params?: string | util.CheckParams
): checks.$ZodCheckSizeEquals<util.Sizeable> {
  return new checks.$ZodCheckSizeEquals({
    check: "size_equals",
    ...util.normalizeCheckParams(params),
    size,
  });
}

export function regex(
  pattern: RegExp,
  params?: string | util.CheckParams
): checks.$ZodCheckRegex {
  return new checks.$ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...util.normalizeCheckParams(params),
    pattern,
  });
}

export function includes(
  includes: string,
  params?: string | util.CheckParams
): checks.$ZodCheckIncludes {
  return new checks.$ZodCheckIncludes({
    check: "includes",
    ...util.normalizeCheckParams(params),
    includes,
  });
}

export function startsWith(
  prefix: string,
  params?: string | util.CheckParams
): checks.$ZodCheckStartsWith {
  return new checks.$ZodCheckStartsWith({
    check: "starts_with",
    ...util.normalizeCheckParams(params),
    prefix,
  });
}

export function endsWith(
  suffix: string,
  params?: string | util.CheckParams
): checks.$ZodCheckEndsWith {
  return new checks.$ZodCheckEndsWith({
    check: "ends_with",
    ...util.normalizeCheckParams(params),
    suffix,
  });
}

// $ZodCheckLowerCase;
export function lowercase(
  params?: string | util.CheckParams
): checks.$ZodCheckLowerCase {
  return new checks.$ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...util.normalizeCheckParams(params),
  });
}

// $ZodCheckUpperCase;
export function uppercase(
  params?: string | util.CheckParams
): checks.$ZodCheckUpperCase {
  return new checks.$ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...util.normalizeCheckParams(params),
  });
}

// $ZodCheckFileName
export function filename(
  fileName: string,
  params?: string | $ZodLiteralParams
): checks.$ZodCheckProperty {
  return new checks.$ZodCheckProperty({
    check: "property",
    property: "name",
    schema: literal(fileName, util.normalizeTypeParams(params)),
  });
}

// $ZodCheckFileType
export function fileType(
  fileTypes: util.MimeTypes | util.MimeTypes[],
  params?: string | util.CheckParams
): checks.$ZodCheckFileType {
  return new checks.$ZodCheckFileType({
    check: "file_type",
    fileTypes: typeof fileTypes === "string" ? [fileTypes] : fileTypes,
    ...util.normalizeCheckParams(params),
  });
}

////////    TRANSFORMS   ////////

export function overwrite<T>(
  tx: (input: T) => T
): checks.$ZodCheckOverwrite<T> {
  return new checks.$ZodCheckOverwrite({
    check: "overwrite",
    tx,
  }) as checks.$ZodCheckOverwrite<T>;
}

// normalize
export function normalize(
  form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})
): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.normalize(form));
}

// trim
export function trim(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.trim());
}
// toLowerCase
export function toLowerCase(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.toLowerCase());
}
// toUpperCase
export function toUpperCase(): checks.$ZodCheckOverwrite<string> {
  return overwrite((input) => input.toUpperCase());
}
