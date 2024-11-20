import * as core from "./core.js";
import type * as errors from "./errors.js";
import * as schemas from "./schemas.js";
import type * as types from "./types.js";

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

//////   UTILS   //////
// export type $ZodErrorMap<
//   T extends errors.$ZodIssueBase = errors.$ZodIssueBase,
// > = errors.$ZodErrorMap<T>;

export type Params<
  T extends core.$ZodType,
  AlsoOmit extends keyof T["_def"] = never,
> = Partial<Omit<T["_def"], "type" | "checks" | "error" | AlsoOmit>> & {
  error?: string | T["_def"]["error"] | undefined;
};

export interface RawCreateParams {
  error?: string | errors.$ZodErrorMap<never> | undefined;
  description?: string | undefined;
  // [k: string]: unknown;
}

export type NormalizedCreateParams<
  T extends RawCreateParams = RawCreateParams,
> = Omit<T, "error"> & {
  error?: errors.$ZodErrorMap<errors.$ZodIssueBase> | undefined;
  // description?: string | undefined;
};

export function normalizeCreateParams<T extends RawCreateParams>(
  params?: T | undefined
): NormalizedCreateParams<T> {
  const processed: NormalizedCreateParams<T> = {} as any;
  if (!params) return processed;
  const { error: _error, description, ...rest } = params;
  if (_error)
    (processed as any).error =
      typeof _error === "string" ? () => _error : _error;
  if (description) processed.description = description;
  Object.assign(processed, rest);
  return processed;
}

export function splitChecksAndParams<T extends RawCreateParams>(
  _paramsOrChecks?: T | unknown[],
  _checks?: unknown[]
): {
  checks: core.$ZodCheck<any>[];
  params: T;
} {
  const params = (
    Array.isArray(_paramsOrChecks) ? {} : _paramsOrChecks ?? {}
  ) as T;
  const checks: any[] = Array.isArray(_paramsOrChecks)
    ? _paramsOrChecks
    : _checks ?? [];
  return {
    checks,
    params,
  };
}

export interface RawCheckParams {
  error?: string | errors.$ZodErrorMap<never>;
  path?: PropertyKey[] | undefined;
}
export interface NormalizedCheckParams {
  error?: errors.$ZodErrorMap;
  path?: PropertyKey[] | undefined;
}

export function normalizeCheckParams(
  params?: string | RawCheckParams
): NormalizedCheckParams {
  if (typeof params === "string") return { error: params } as any;
  if (!params) return {} as any;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error } as any;
  return params as any;
}

export interface PrimitiveFactory<
  Params extends RawCreateParams,
  T extends core.$ZodType,
> {
  (): T;
  (checks: core.$ZodCheck<core.output<T>>[]): T;
  (params: Partial<Params>, checks?: core.$ZodCheck<core.output<T>>[]): T;
}

export const factory: <
  Cls extends { new (...args: any[]): core.$ZodType },
  Params extends RawCreateParams,
  // T extends InstanceType<Cls> = InstanceType<Cls>,
>(
  Cls: Cls,
  defaultParams: Omit<
    InstanceType<Cls>["_def"],
    "checks" | "description" | "error"
  >
) => PrimitiveFactory<Params, InstanceType<Cls>> = (Cls, defaultParams) => {
  return (...args: any[]) => {
    const { checks, params } = splitChecksAndParams(...args);
    return new Cls({
      ...defaultParams,
      checks,
      ...normalizeCreateParams(params),
    }) as InstanceType<typeof Cls>;
  };
};

//////   API   //////

interface $ZodStringParams
  extends Params<schemas.$ZodString<string>, "coerce"> {}
export const string: PrimitiveFactory<
  $ZodStringParams,
  schemas.$ZodString<string>
> = factory(schemas.$ZodString, {
  type: "string",
}) as any;

// $ZodUUID
interface $ZodUUIDParams extends Params<schemas.$ZodUUID, "coerce"> {}
export const uuid: PrimitiveFactory<$ZodUUIDParams, schemas.$ZodUUID> = factory(
  schemas.$ZodUUID,
  {
    type: "string",
    format: "uuid",
    check: "string_format",
  }
);

// $ZodEmail
interface $ZodEmailParams extends Params<schemas.$ZodEmail, "coerce"> {}
export const email: PrimitiveFactory<$ZodEmailParams, schemas.$ZodEmail> =
  factory(schemas.$ZodEmail, {
    type: "string",
    format: "email",
    check: "string_format",
  });

// $ZodURL
interface $ZodURLParams extends Params<schemas.$ZodURL, "coerce"> {}
export const url: PrimitiveFactory<$ZodURLParams, schemas.$ZodURL> = factory(
  schemas.$ZodURL,
  {
    type: "string",
    format: "url",
    check: "string_format",
  }
);

// $ZodEmoji
interface $ZodEmojiParams extends Params<schemas.$ZodEmoji, "coerce"> {}
export const emoji: PrimitiveFactory<$ZodEmojiParams, schemas.$ZodEmoji> =
  factory(schemas.$ZodEmoji, {
    type: "string",
    format: "emoji",
    check: "string_format",
  });

// $ZodNanoID
interface $ZodNanoIDParams extends Params<schemas.$ZodNanoID, "coerce"> {}
export const nanoid: PrimitiveFactory<$ZodNanoIDParams, schemas.$ZodNanoID> =
  factory(schemas.$ZodNanoID, {
    type: "string",
    format: "nanoid",
    check: "string_format",
  });

// $ZodCUID
interface $ZodCUIDParams extends Params<schemas.$ZodCUID, "coerce"> {}
export const cuid: PrimitiveFactory<$ZodCUIDParams, schemas.$ZodCUID> = factory(
  schemas.$ZodCUID,
  {
    type: "string",
    format: "cuid",
    check: "string_format",
  }
);

// $ZodCUID2
interface $ZodCUID2Params extends Params<schemas.$ZodCUID2, "coerce"> {}
export const cuid2: PrimitiveFactory<$ZodCUID2Params, schemas.$ZodCUID2> =
  factory(schemas.$ZodCUID2, {
    type: "string",
    format: "cuid2",
    check: "string_format",
  });

// $ZodULID
interface $ZodULIDParams extends Params<schemas.$ZodULID, "coerce"> {}
export const ulid: PrimitiveFactory<$ZodULIDParams, schemas.$ZodULID> = factory(
  schemas.$ZodULID,
  {
    type: "string",
    format: "ulid",
    check: "string_format",
  }
);

// $ZodXID
interface $ZodXIDParams extends Params<schemas.$ZodXID, "coerce"> {}
export const xid: PrimitiveFactory<$ZodXIDParams, schemas.$ZodXID> = factory(
  schemas.$ZodXID,
  {
    type: "string",
    format: "xid",
    check: "string_format",
  }
);

// $ZodKSUID
interface $ZodKSUIDParams extends Params<schemas.$ZodKSUID, "coerce"> {}
export const ksuid: PrimitiveFactory<$ZodKSUIDParams, schemas.$ZodKSUID> =
  factory(schemas.$ZodKSUID, {
    type: "string",
    format: "ksuid",
    check: "string_format",
  });

// $ZodDuration
interface $ZodDurationParams extends Params<schemas.$ZodDuration, "coerce"> {}
export const duration: PrimitiveFactory<
  $ZodDurationParams,
  schemas.$ZodDuration
> = factory(schemas.$ZodDuration, {
  type: "string",
  format: "duration",
  check: "string_format",
});

// $ZodIP
interface $ZodIPParams extends Params<schemas.$ZodIP, "coerce"> {}
export const ip: PrimitiveFactory<$ZodIPParams, schemas.$ZodIP> = factory(
  schemas.$ZodIP,
  {
    type: "string",
    format: "ip",
    check: "string_format",
  }
);

// $ZodIPv4
interface $ZodIPv4Params extends Params<schemas.$ZodIPv4, "coerce"> {}
export const ipv4: PrimitiveFactory<$ZodIPv4Params, schemas.$ZodIPv4> = factory(
  schemas.$ZodIPv4,
  {
    type: "string",
    format: "ipv4",
    check: "string_format",
  }
);

// $ZodIPv6
interface $ZodIPv6Params extends Params<schemas.$ZodIPv6, "coerce"> {}
export const ipv6: PrimitiveFactory<$ZodIPv6Params, schemas.$ZodIPv6> = factory(
  schemas.$ZodIPv6,
  {
    type: "string",
    format: "ipv6",
    check: "string_format",
  }
);

// $ZodBase64
interface $ZodBase64Params extends Params<schemas.$ZodBase64, "coerce"> {}
export const base64: PrimitiveFactory<$ZodBase64Params, schemas.$ZodBase64> =
  factory(schemas.$ZodBase64, {
    type: "string",
    format: "base64",
    check: "string_format",
  });

// $ZodJSONString
interface $ZodJSONStringParams
  extends Params<schemas.$ZodJSONString, "coerce"> {}
export const jsonString: PrimitiveFactory<
  $ZodJSONStringParams,
  schemas.$ZodJSONString
> = factory(schemas.$ZodJSONString, {
  type: "string",
  format: "json_string",
  check: "string_format",
});

// $ZodE164
interface $ZodE164Params extends Params<schemas.$ZodE164, "coerce"> {}
export const e164: PrimitiveFactory<$ZodE164Params, schemas.$ZodE164> = factory(
  schemas.$ZodE164,
  {
    type: "string",
    format: "e164",
    check: "string_format",
  }
);

// $ZodJWT
interface $ZodJWTParams extends Params<schemas.$ZodJWT, "coerce"> {
  algorithm?: schemas.$ZodJWT["_def"]["algorithm"];
}
export const jwt: PrimitiveFactory<$ZodJWTParams, schemas.$ZodJWT> = factory(
  schemas.$ZodJWT,
  {
    type: "string",
    format: "jwt",
    check: "string_format",
  }
);

// number
interface $ZodNumberParams
  extends Params<schemas.$ZodNumber<number>, "format" | "coerce"> {}
export const number: PrimitiveFactory<
  $ZodNumberParams,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumberFast, { type: "number" }) as any;

// int
interface $ZodIntParams extends $ZodNumberParams {}
export const int: PrimitiveFactory<
  $ZodIntParams,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "safeint" }) as any;

// float32
interface $ZodFloat32Params extends $ZodNumberParams {}
export const float32: PrimitiveFactory<
  $ZodFloat32Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "float32" }) as any;

// float64
interface $ZodFloat64Params extends $ZodNumberParams {}
export const float64: PrimitiveFactory<
  $ZodFloat64Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "float64" }) as any;

// int32
interface $ZodInt32Params extends $ZodNumberParams {}
export const int32: PrimitiveFactory<
  $ZodInt32Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "int32" }) as any;

// uint32
interface $ZodUInt32Params extends $ZodNumberParams {}
export const uint32: PrimitiveFactory<
  $ZodUInt32Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "uint32" }) as any;

// int64
interface $ZodInt64Params extends $ZodNumberParams {}
export const int64: PrimitiveFactory<
  $ZodInt64Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "int64" }) as any;

// uint64
interface $ZodUInt64Params extends $ZodNumberParams {}
export const uint64: PrimitiveFactory<
  $ZodUInt64Params,
  schemas.$ZodNumber<number>
> = factory(schemas.$ZodNumber, { type: "number", format: "uint64" }) as any;

// boolean
interface $ZodBooleanParams extends Params<schemas.$ZodBoolean<boolean>> {}
export const boolean: PrimitiveFactory<
  $ZodBooleanParams,
  schemas.$ZodBoolean<boolean>
> = factory(schemas.$ZodBoolean, { type: "boolean" }) as any;

// bigint
interface $ZodBigIntParams extends Params<schemas.$ZodBigInt<bigint>> {}
export const bigint: PrimitiveFactory<
  $ZodBigIntParams,
  schemas.$ZodBigInt<bigint>
> = factory(schemas.$ZodBigInt, { type: "bigint" }) as any;

// symbol
interface $ZodSymbolParams extends Params<schemas.$ZodSymbol<symbol>> {}
export const symbol: PrimitiveFactory<
  $ZodSymbolParams,
  schemas.$ZodSymbol<symbol>
> = factory(schemas.$ZodSymbol, { type: "symbol" }) as any;

// date
interface $ZodDateParams extends Params<schemas.$ZodDate> {}
export const date: PrimitiveFactory<$ZodDateParams, schemas.$ZodDate> = factory(
  schemas.$ZodDate,
  { type: "date" }
);

// undefined
interface $ZodUndefinedParams extends Params<schemas.$ZodUndefined> {}
const _undefined: PrimitiveFactory<$ZodUndefinedParams, schemas.$ZodUndefined> =
  factory(schemas.$ZodUndefined, { type: "undefined" });

export { _undefined as undefined };

// null
interface $ZodNullParams extends Params<schemas.$ZodNull> {}
export const _null: PrimitiveFactory<$ZodNullParams, schemas.$ZodNull> =
  factory(schemas.$ZodNull, { type: "null" });
export { _null as null };

// any
interface $ZodAnyParams extends Params<schemas.$ZodAny> {}
export const any: PrimitiveFactory<$ZodAnyParams, schemas.$ZodAny> = factory(
  schemas.$ZodAny,
  { type: "any" }
);

// unknown
interface $ZodUnknownParams extends Params<schemas.$ZodUnknown> {}
export const unknown: PrimitiveFactory<$ZodUnknownParams, schemas.$ZodUnknown> =
  factory(schemas.$ZodUnknown, { type: "unknown" });

// never
interface $ZodNeverParams extends Params<schemas.$ZodNever> {}
export const never: PrimitiveFactory<$ZodNeverParams, schemas.$ZodNever> =
  factory(schemas.$ZodNever, { type: "never" });

// void
interface $ZodVoidParams extends Params<schemas.$ZodVoid> {}
export const _void: PrimitiveFactory<$ZodVoidParams, schemas.$ZodVoid> =
  factory(schemas.$ZodVoid, { type: "void" });
export { _void as void };

// array
interface $ZodArrayParams extends Params<schemas.$ZodArray, "element"> {}
export function array<T extends core.$ZodType>(
  element: T,
  params?: $ZodArrayParams
): schemas.$ZodArray<T> {
  return new schemas.$ZodArray({
    type: "array",
    element,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodArray<T>;
}

// object
interface $ZodObjectParams extends Params<schemas.$ZodObject, "shape"> {}
export function object<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    ...normalizeCreateParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
}

// strictObject
interface $ZodStrictObjectParams
  extends Params<schemas.$ZodObject, "shape" | "catchall"> {}
export function strictObject<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodStrictObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    catchall: never(),
    ...normalizeCreateParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
}

// looseObject
interface $ZodLooseObjectParams
  extends Params<schemas.$ZodObject, "shape" | "catchall"> {}
export function looseObject<T extends schemas.$ZodRawShape>(
  shape: T,
  params?: $ZodLooseObjectParams
): schemas.$ZodObject<T> {
  const def: schemas.$ZodObjectDef = {
    type: "object",
    shape,
    catchall: unknown(),
    ...normalizeCreateParams(params),
  };
  return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
}

// .keyof
export function keyof<T extends schemas.$ZodObject>(
  schema: T
): schemas.$ZodEnum<schemas.$ToEnum<Exclude<keyof T["_shape"], symbol>>> {
  return _enum(Object.keys(schema._def.shape)) as any;
}

// .extend
export function extend<
  T extends schemas.$ZodObject,
  U extends schemas.$ZodRawShape,
>(schema: T, shape: U): schemas.$ZodObject<T["_shape"] & U> {
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
>(base: T, incoming: U): schemas.$ZodObject<T["_shape"] & U["_shape"]> {
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
  M extends types.Exactly<Mask<keyof T["_shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.$ZodObject<Pick<T["_shape"], Extract<keyof T["_shape"], keyof M>>> {
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
  M extends types.Exactly<Mask<keyof T["_shape"]>, M>,
>(
  schema: T,
  mask: M
): schemas.$ZodObject<Omit<T["_shape"], Extract<keyof T["_shape"], keyof M>>> {
  const shape: schemas.$ZodRawShape = { ...schema._shape };
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
  [k in keyof T["_shape"]]: schemas.$ZodOptional<T["_shape"][k]>;
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
interface $ZodUnionParams extends Params<schemas.$ZodUnion, "options"> {}
export function union<T extends core.$ZodType[]>(
  options: T,
  params?: $ZodUnionParams
): schemas.$ZodUnion<T> {
  return new schemas.$ZodUnion({
    type: "union",
    options,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodUnion<T>;
}

// or
// export const or: typeof union = union;

// discriminatedUnion
export interface $ZodHasDiscriminator extends core.$ZodType {
  _disc: core.$DiscriminatorMap;
}
interface $ZodDiscriminatedUnionParams
  extends Params<schemas.$ZodDiscriminatedUnion, "options"> {}
export function discriminatedUnion<
  Types extends [$ZodHasDiscriminator, ...$ZodHasDiscriminator[]],
>(
  options: Types,
  params?: $ZodDiscriminatedUnionParams
): schemas.$ZodDiscriminatedUnion<Types> {
  return new schemas.$ZodDiscriminatedUnion({
    type: "union",
    options,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodDiscriminatedUnion<Types>;
}

// intersection
interface $ZodIntersectionParams
  extends Params<schemas.$ZodIntersection, "left" | "right"> {}
export function intersection<T extends core.$ZodType, U extends core.$ZodType>(
  left: T,
  right: U,
  params?: $ZodIntersectionParams
): schemas.$ZodIntersection<T, U> {
  return new schemas.$ZodIntersection({
    type: "intersection",
    left,
    right,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodIntersection<T, U>;
}

// and
// export const and: typeof intersection = intersection;

// tuple
interface $ZodTupleParams extends Params<schemas.$ZodTuple, "items"> {
  // rest?: schemas.$ZodTuple["_def"]["rest"];
}

export function tuple<T extends [core.$ZodType, ...core.$ZodType[]]>(
  items: T,
  params?: $ZodTupleParams
): schemas.$ZodTuple<T, null>;
export function tuple<
  T extends [core.$ZodType, ...core.$ZodType[]],
  Rest extends core.$ZodType,
>(items: T, rest: Rest, params?: $ZodTupleParams): schemas.$ZodTuple<T, Rest>;
export function tuple(
  items: core.$ZodType[],
  _paramsOrRest?: $ZodTupleParams | core.$ZodType,
  _params?: $ZodTupleParams
) {
  const hasRest = _paramsOrRest instanceof core.$ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new schemas.$ZodTuple({
    type: "tuple",
    items,
    rest,
    ...normalizeCreateParams(params),
  });
}

// record
interface $ZodRecordParams
  extends Params<schemas.$ZodRecord, "keySchema" | "valueSchema"> {}
export function record<
  Key extends schemas.$ZodPropertyKey,
  Value extends core.$ZodType,
>(
  keySchema: Key,
  valueSchema: Value,
  params?: $ZodRecordParams
): schemas.$ZodRecord<Key, Value> {
  return new schemas.$ZodRecord({
    type: "record",
    keySchema,
    valueSchema,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodRecord<Key, Value>;
}

// map
interface $ZodMapParams
  extends Params<schemas.$ZodMap, "keyType" | "valueType"> {}
export function map<Key extends core.$ZodType, Value extends core.$ZodType>(
  keyType: Key,
  valueType: Value,
  params?: $ZodMapParams
): schemas.$ZodMap<Key, Value> {
  return new schemas.$ZodMap({
    type: "map",
    keyType,
    valueType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodMap<Key, Value>;
}

// set
interface $ZodSetParams extends Params<schemas.$ZodSet, "valueType"> {}
export function set<Value extends core.$ZodType>(
  valueType: Value,
  params?: $ZodSetParams
): schemas.$ZodSet<Value> {
  return new schemas.$ZodSet({
    type: "set",
    valueType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodSet<Value>;
}

// enum
interface $ZodEnumParams extends Params<schemas.$ZodEnum, "entries"> {}
function _enum<const T extends string[]>(
  values: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<schemas.$ToEnum<T[number]>> {
  const entries: schemas.$EnumLike = {};
  for (const val of values) {
    entries[val] = val;
  }

  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...normalizeCreateParams(params),
  }) as any as schemas.$ZodEnum<schemas.$ToEnum<T[number]>>;
}
export { _enum as enum };

// nativeEnum
// interface $ZodNativeEnumParams
//   extends Params<schemas.$ZodNativeEnum, "entries"> {}
export function nativeEnum<T extends schemas.$EnumLike>(
  entries: T,
  params?: $ZodEnumParams
): schemas.$ZodEnum<T> {
  return new schemas.$ZodEnum({
    type: "enum",
    entries,
    ...normalizeCreateParams(params),
  }) as any as schemas.$ZodEnum<T>;
}

// literal
interface $ZodLiteralParams extends Params<schemas.$ZodLiteral, "literals"> {}
export function literal<const T extends schemas.$Literal | schemas.$Literal[]>(
  value: T,
  params?: $ZodLiteralParams
): schemas.$ZodLiteral<T extends schemas.$Literal ? [T] : T> {
  return new schemas.$ZodLiteral({
    type: "enum",
    literals: Array.isArray(value) ? value : [value],
    ...normalizeCreateParams(params),
  }) as schemas.$ZodLiteral<T extends schemas.$Literal ? [T] : T>;
}

// envbool
// interface $ZodEnvBoolParams
//   extends Params<schemas.$ZodSuccess, "innerType">,
//     Params<schemas.$ZodEnum, "values"> {
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
interface $ZodFileParams extends Params<schemas.$ZodFile> {}
export const file: PrimitiveFactory<$ZodFileParams, schemas.$ZodFile> = factory(
  schemas.$ZodFile,
  { type: "file" }
);

// effect
interface $ZodEffectParams extends Params<schemas.$ZodEffect, "effect"> {}
export function effect<O = unknown, I = unknown>(
  effect: (input: I, ctx?: core.$ParseContext) => O,
  params?: $ZodEffectParams
): schemas.$ZodEffect<O, I> {
  return new schemas.$ZodEffect({
    type: "effect",
    effect: effect as any,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodEffect<O, I>;
}

// preprocess
interface $ZodPreprocessParams extends $ZodEffectParams, $ZodPipelineParams {}
export function preprocess<T, U extends core.$ZodType<unknown, T>>(
  _effect: (arg: unknown) => T,
  schema: U,
  params?: $ZodPreprocessParams
): schemas.$ZodPipeline<schemas.$ZodEffect<T, unknown>, U> {
  return pipeline(effect(_effect, params), schema, params);
}
// interface $ZodPreprocessParams
//   extends Params<schemas.$ZodPreprocess, "effect"> {}
// export function preprocess<T extends core.$ZodType>(
//   schema: T,
//   effect: (arg: unknown) => core.input<T>,
//   params?: $ZodPreprocessParams
// ): schemas.$ZodPreprocess<T> {
//   return new schemas.$ZodPreprocess({
//     type: "preprocess",
//     schema,
//     effect,
//     ...normalizeCreateParams(params),
//   }) as schemas.$ZodPreprocess<T>;
// }

// transform
// rewrite to use pipeline and effect
interface $ZodTransformParams extends $ZodEffectParams, $ZodPipelineParams {}
export function transform<T extends core.$ZodType, NewOut>(
  schema: T,
  _effect: (arg: core.output<T>) => NewOut,
  params?: $ZodTransformParams
): schemas.$ZodPipeline<
  T,
  schemas.$ZodEffect<Awaited<NewOut>, core.output<T>>
> {
  return pipeline(schema, effect(_effect, params), params) as any;
}
// interface $ZodTransformParams
//   extends Params<schemas.$ZodTransform, "schema" | "effect"> {}
// export function transform<T extends core.$ZodType, NewOut>(
//   schema: T,
//   effect: (arg: core.output<T>) => NewOut,
//   params?: $ZodTransformParams
// ): schemas.$ZodTransform<T> {
//   return new schemas.$ZodTransform({
//     type: "transform",
//     schema,
//     effect,
//     ...normalizeCreateParams(params),
//   }) as schemas.$ZodTransform<T>;
// }

// optional
interface $ZodOptionalParams
  extends Params<schemas.$ZodOptional, "innerType"> {}
export function optional<T extends core.$ZodType>(
  innerType: T,
  params?: $ZodOptionalParams
): schemas.$ZodOptional<T> {
  return new schemas.$ZodOptional({
    type: "optional",
    innerType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodOptional<T>;
}

// nullable
interface $ZodNullableParams
  extends Params<schemas.$ZodNullable, "innerType"> {}
export function nullable<T extends core.$ZodType>(
  innerType: T,
  params?: $ZodNullableParams
): schemas.$ZodNullable<T> {
  return new schemas.$ZodNullable({
    type: "nullable",
    innerType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodNullable<T>;
}

// success
interface $ZodSuccessParams extends Params<schemas.$ZodSuccess, "innerType"> {}
export function success<T extends core.$ZodType>(
  innerType: T,
  params?: $ZodSuccessParams
): schemas.$ZodSuccess<T> {
  return new schemas.$ZodSuccess({
    type: "success",
    innerType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodSuccess<T>;
}

// default
interface $ZodDefaultParams extends Params<schemas.$ZodDefault, "innerType"> {}
function _default<T extends core.$ZodType>(
  innerType: T,
  defaultValue: core.output<T> | (() => core.output<T>),
  params?: $ZodDefaultParams
): schemas.$ZodDefault<T> {
  return new schemas.$ZodDefault({
    type: "default",
    innerType,
    defaultValue:
      defaultValue instanceof Function ? defaultValue : () => defaultValue,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodDefault<T>;
}
export { _default };

// catch
interface $ZodCatchParams extends Params<schemas.$ZodCatch, "innerType"> {}
function _catch<T extends core.$ZodType>(
  innerType: T,
  catchValue: core.output<T> | (() => core.output<T>),
  params?: $ZodCatchParams
): schemas.$ZodCatch<T> {
  return new schemas.$ZodCatch({
    type: "catch",
    innerType,
    catchValue: catchValue instanceof Function ? catchValue : () => catchValue,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodCatch<T>;
}
export { _catch as catch };

// nan
interface $ZodNaNParams extends Params<schemas.$ZodNaN> {}
export const nan: PrimitiveFactory<$ZodNaNParams, schemas.$ZodNaN> = factory(
  schemas.$ZodNaN,
  { type: "nan" }
);

// pipeline
interface $ZodPipelineParams
  extends Params<schemas.$ZodPipeline, "in" | "out"> {}
export function pipeline<
  T extends core.$ZodType,
  U extends core.$ZodType<any, T["_output"]>,
>(
  in_: T,
  // fn: (arg: core.output<T>) => core.input<U>,
  out: U,
  params?: $ZodPipelineParams
): schemas.$ZodPipeline<T, U> {
  return new schemas.$ZodPipeline({
    type: "pipeline",
    in: in_,
    out,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodPipeline<T, U>;
}

// readonly
interface $ZodReadonlyParams
  extends Params<schemas.$ZodReadonly, "innerType"> {}
export function readonly<T extends core.$ZodType>(
  innerType: T,
  params?: $ZodReadonlyParams
): schemas.$ZodReadonly<T> {
  return new schemas.$ZodReadonly({
    type: "readonly",
    innerType,
    ...normalizeCreateParams(params),
  }) as schemas.$ZodReadonly<T>;
}

// templateLiteral
interface $ZodTemplateLiteralParams
  extends Params<schemas.$ZodTemplateLiteral, "parts"> {}
export function templateLiteral<
  const Parts extends schemas.$TemplateLiteralPart[],
>(
  parts: Parts,
  params?: $ZodTemplateLiteralParams
): schemas.$ZodTemplateLiteral<schemas.$PartsToTemplateLiteral<Parts>> {
  return new schemas.$ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...normalizeCreateParams(params),
  }) as any;
}

// custom
// type lkjasdf = errors.$ZodIssueCustom[''];
// interface CustomParams
//   extends Omit<
//     errors.$ZodIssueData<errors.$ZodIssueCustom>,
//     "code" | "origin" | "input"
//   > {}

interface CustomParams extends RawCheckParams {
  error?: string | errors.$ZodErrorMap<errors.$ZodIssueCustom>;
  path?: PropertyKey[];
}
export type ZodCustom<T> = core.$ZodType<T, T>;
export function custom<T>(
  fn?: (data: unknown) => unknown,
  _params: string | CustomParams = {}
): ZodCustom<T> {
  let result = new schemas.$ZodAny({
    type: "any",
  });

  const params = normalizeCheckParams(_params);

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
): ZodCustom<InstanceType<T>> {
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
  final: core.$ZodResultFull,
  input: unknown,
  def: NormalizedCheckParams,
  path: PropertyKey[] = []
): void | Promise<void> {
  if (!result) {
    final.issues.push(customIssue({ input, def, path }));
  }
}

export function refine<T>(
  fn: (arg: T) => unknown | Promise<unknown>,
  _params: string | CustomParams = {}
): core.$ZodCheck<T> {
  const params = normalizeCheckParams(_params as RawCheckParams);
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

interface RefinementCtx {
  addIssue(arg: errors.$ZodIssueData | string): void;
}
export function superRefine<T>(
  fn: (arg: T, ctx: RefinementCtx) => void | Promise<void>
): core.$ZodCheck<T> {
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

export function parse<T extends core.$ZodType>(
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

  if (result.issues?.length) {
    throw core.$finalize(result.issues!, ctx);
  }
  return result.value as core.output<T>;
}

type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: core.$ZodError };
export function safeParse<T extends core.$ZodType>(
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
    core.$failed(result)
      ? { success: false, error: core.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as SafeParseResult<core.output<T>>;
}

export async function parseAsync<T extends core.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): Promise<core.output<T>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  if (core.$failed(result)) throw core.$finalize(result.issues);
  return result.value as core.output<T>;
}

export async function safeParseAsync<T extends core.$ZodType>(
  schema: T,
  data: unknown,
  ctx?: core.$ParseContext
): Promise<SafeParseResult<core.output<T>>> {
  let result = schema._parse(data, ctx);
  if (result instanceof Promise) result = await result;
  return (
    core.$failed(result)
      ? { success: false, error: core.$finalize(result.issues, ctx) }
      : { success: true, data: result.value }
  ) as SafeParseResult<core.output<T>>;
}
