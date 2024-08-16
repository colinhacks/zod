import * as classes from "./classes.js";
import type * as core from "./core.js";
import type * as err from "./errors.js";
import type * as types from "./types.js";

///////////////////////////////////////
///////////////////////////////////////
//////////                   //////////
//////////      ZodType      //////////
//////////                   //////////
///////////////////////////////////////
///////////////////////////////////////

export type RawCreateParams =
  | {
      error?: err.ZodErrorMap;
      /** @deprecated The `errorMap` parameter has been renamed to simply `error`.
       *
       * @example ```ts
       * z.string().create({ error: myErrorMap });
       * ```
       */
      errorMap?: err.ZodErrorMap;
      /** @deprecated The `invalid_type_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
       *
       * @example ```ts
       * z.string({
       *   error: { invalid_type: 'Custom error message' }
       * });
       * ```
       */
      invalid_type_error?: string;
      /**
       * @deprecated The `required_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
       * @example ```ts
       * z.string({
       *  error: { required: 'Custom error message' }
       * });
       */
      required_error?: string;
      /** @deprecated Use `error` instead. */
      message?: string;
      description?: string;
    }
  | undefined;

export type ProcessedCreateParams = {
  errorMap?: err.ZodErrorMap;
  description?: string | undefined;
};

export function processCreateParams(
  params: RawCreateParams
): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: err.ZodErrorMap = (iss, ctx) => {
    const { message } = params;

    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export function string(
  params?: RawCreateParams & { coerce?: true }
): classes.$ZodString<{}> {
  const base = new classes.$ZodString({
    typeName: classes.$ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    checks: [],
    ...processCreateParams(params),
  });
  return base;
}

export function number(
  params?: RawCreateParams & { coerce?: boolean }
): classes.$ZodNumber {
  return new classes.$ZodNumber({
    checks: [],
    typeName: classes.$ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params),
  });
}

export function bigint(
  params?: RawCreateParams & { coerce?: boolean }
): classes.$ZodBigInt {
  return new classes.$ZodBigInt({
    checks: [],
    typeName: classes.$ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params),
  });
}

export function boolean(
  params?: RawCreateParams & { coerce?: boolean }
): classes.$ZodBoolean {
  return new classes.$ZodBoolean({
    typeName: classes.$ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    checks: [],
    ...processCreateParams(params),
  });
}

export function date(
  params?: RawCreateParams & { coerce?: boolean }
): classes.$ZodDate {
  return new classes.$ZodDate({
    coerce: params?.coerce || false,
    typeName: classes.$ZodFirstPartyTypeKind.ZodDate,
    checks: [],
    ...processCreateParams(params),
  });
}

export function symbol(params?: RawCreateParams): classes.$ZodSymbol {
  return new classes.$ZodSymbol({
    typeName: classes.$ZodFirstPartyTypeKind.ZodSymbol,
    checks: [],
    ...processCreateParams(params),
  });
}

export function _undefined(params?: RawCreateParams): classes.$ZodUndefined {
  return new classes.$ZodUndefined({
    typeName: classes.$ZodFirstPartyTypeKind.ZodUndefined,
    checks: [],
    ...processCreateParams(params),
  });
}

export function _null(params?: RawCreateParams): classes.$ZodNull {
  return new classes.$ZodNull({
    typeName: classes.$ZodFirstPartyTypeKind.ZodNull,
    checks: [],
    ...processCreateParams(params),
  });
}

export function any(params?: RawCreateParams): classes.$ZodAny {
  return new classes.$ZodAny({
    typeName: classes.$ZodFirstPartyTypeKind.ZodAny,
    checks: [],
    ...processCreateParams(params),
  });
}

export function unknown(params?: RawCreateParams): classes.$ZodUnknown {
  return new classes.$ZodUnknown({
    typeName: classes.$ZodFirstPartyTypeKind.ZodUnknown,
    checks: [],
    ...processCreateParams(params),
  });
}

export function never(params?: RawCreateParams): classes.$ZodNever {
  return new classes.$ZodNever({
    typeName: classes.$ZodFirstPartyTypeKind.ZodNever,
    checks: [],
    ...processCreateParams(params),
  });
}

export function _void(params?: RawCreateParams): classes.$ZodVoid {
  return new classes.$ZodVoid({
    typeName: classes.$ZodFirstPartyTypeKind.ZodVoid,
    checks: [],
    ...processCreateParams(params),
  });
}

export function array<T extends core.$ZodType>(
  schema: T,
  params?: RawCreateParams
): classes.$ZodArray<T> {
  return new classes.$ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    uniqueness: null,
    typeName: classes.$ZodFirstPartyTypeKind.ZodArray,
    checks: [],
    ...processCreateParams(params),
  });
}

export function object<T extends classes.$ZodRawShape>(
  shape: T,
  params?: RawCreateParams
): classes.$ZodObject<
  T,
  "strip",
  core.$ZodType,
  objectOutputType<T, core.$ZodType, "strip">,
  objectInputType<T, core.$ZodType, "strip">
> {
  return new classes.$ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: classes.$ZodNever.create(),
    typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

function objectStrict<T extends classes.$ZodRawShape>(
  shape: T,
  params?: RawCreateParams
): classes.$ZodObject<T, "strict"> {
  return new classes.$ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: classes.$ZodNever.create(),
    typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function objectLazy<T extends classes.$ZodRawShape>(
  shape: () => T,
  params?: RawCreateParams
): classes.$ZodObject<T, "strip"> {
  return new classes.$ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: classes.$ZodNever.create(),
    typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function union<
  T extends Readonly<[$ZodType, core.$ZodType, ...$ZodType[]]>,
>(types: T, params?: RawCreateParams): classes.$ZodUnion<T> {
  return new classes.$ZodUnion({
    options: types,
    typeName: classes.$ZodFirstPartyTypeKind.ZodUnion,
    checks: [],
    ...processCreateParams(params),
  });
}
/**
 * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
 * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
 * have a different value for each object in the union.
 * @param discriminator the name of the discriminator property
 * @param types an array of object schemas
 * @param params
 */
function discriminatedUnion<
  Discriminator extends string,
  Types extends [
    classes.$ZodDiscriminatedUnionOption<Discriminator>,
    ...$ZodDiscriminatedUnionOption<Discriminator>[],
  ],
>(
  discriminator: Discriminator,
  options: Types,
  params?: RawCreateParams
): classes.$ZodDiscriminatedUnion<Discriminator, Types> {
  // Get all the valid discriminator values
  const optionsMap: Map<types.Primitive, Types[number]> = new Map();

  // try {
  for (const type of options) {
    const discriminatorValues = getDiscriminator(type.shape[discriminator]);
    if (!discriminatorValues.length) {
      throw new Error(
        `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
      );
    }
    for (const value of discriminatorValues) {
      if (optionsMap.has(value)) {
        throw new Error(
          `Discriminator property ${String(
            discriminator
          )} has duplicate value ${String(value)}`
        );
      }

      optionsMap.set(value, type);
    }
  }

  return new classes.$ZodDiscriminatedUnion<
    Discriminator,
    // DiscriminatorValue,
    Types
  >({
    typeName: classes.$ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
    discriminator,
    options,
    optionsMap,
    checks: [],
    ...processCreateParams(params),
  });
}

export function intersection<T extends core.$ZodType, U extends core.$ZodType>(
  left: T,
  right: U,
  params?: RawCreateParams
): classes.$ZodIntersection<T, U> {
  return new classes.$ZodIntersection({
    left: left,
    right: right,
    typeName: classes.$ZodFirstPartyTypeKind.ZodIntersection,
    checks: [],
    ...processCreateParams(params),
  });
}

export function tuple<T extends [$ZodType, ...$ZodType[]] | []>(
  schemas: T,
  params?: RawCreateParams
): classes.$ZodTuple<T, null> {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new classes.$ZodTuple({
    items: schemas,
    typeName: classes.$ZodFirstPartyTypeKind.ZodTuple,
    rest: null,

    checks: [],
    ...processCreateParams(params),
  });
}

export function record<Value extends core.$ZodType>(
  valueType: Value,
  params?: RawCreateParams
): classes.$ZodRecord<ZodString, Value>;
function record<Keys extends KeySchema, Value extends core.$ZodType>(
  keySchema: Keys,
  valueType: Value,
  params?: RawCreateParams
): classes.$ZodRecord<Keys, Value>;
function record(
  first: any,
  second?: any,
  third?: any
): classes.$ZodRecord<any, any> {
  if (second instanceof core.$ZodType) {
    return new classes.$ZodRecord({
      keyType: first,
      valueType: second,
      typeName: classes.$ZodFirstPartyTypeKind.ZodRecord,
      checks: [],
      ...processCreateParams(third),
    });
  }

  return new classes.$ZodRecord({
    keyType: classes.$ZodString.create(),
    valueType: first,
    typeName: classes.$ZodFirstPartyTypeKind.ZodRecord,
    checks: [],
    ...processCreateParams(second),
  });
}

export function map<
  Key extends core.$ZodType = core.$ZodType,
  Value extends core.$ZodType = core.$ZodType,
>(
  keyType: Key,
  valueType: Value,
  params?: RawCreateParams
): classes.$ZodMap<Key, Value> {
  return new classes.$ZodMap({
    valueType,
    keyType,
    typeName: classes.$ZodFirstPartyTypeKind.ZodMap,
    checks: [],
    ...processCreateParams(params),
  });
}

export function set<Value extends core.$ZodType = core.$ZodType>(
  valueType: Value,
  params?: RawCreateParams
): classes.$ZodSet<Value> {
  return new classes.$ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: classes.$ZodFirstPartyTypeKind.ZodSet,
    checks: [],
    ...processCreateParams(params),
  });
}

export function _function(): classes.$ZodFunction<
  $ZodTuple<[], classes.$ZodUnknown>,
  classes.$ZodUnknown
>;
function _function<
  T extends Any$ZodTuple = classes.$ZodTuple<[], classes.$ZodUnknown>,
>(args: T): classes.$ZodFunction<T, classes.$ZodUnknown>;
function _function<T extends Any$ZodTuple, U extends core.$ZodType>(
  args: T,
  returns: U
): classes.$ZodFunction<T, U>;
function _function<
  T extends Any$ZodTuple = classes.$ZodTuple<[], classes.$ZodUnknown>,
  U extends core.$ZodType = classes.$ZodUnknown,
>(args: T, returns: U, params?: RawCreateParams): classes.$ZodFunction<T, U>;
function _function(
  args?: Any$ZodTuple,
  returns?: core.$ZodType,
  params?: RawCreateParams
) {
  return new classes.$ZodFunction({
    args: (args
      ? args
      : classes.$ZodTuple.create([]).rest(ZodUnknown.create())) as any,
    returns: returns || classes.$ZodUnknown.create(),
    typeName: classes.$ZodFirstPartyTypeKind.ZodFunction,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function lazy<T extends core.$ZodType>(
  getter: () => T,
  params?: RawCreateParams
): classes.$ZodLazy<T> {
  return new classes.$ZodLazy({
    getter: getter,
    typeName: classes.$ZodFirstPartyTypeKind.ZodLazy,
    checks: [],
    ...processCreateParams(params),
  });
}

export function literal<T extends types.Primitive>(
  value: T,
  params?: RawCreateParams & Exclude<types.ErrMessage, string>
): classes.$ZodLiteral<T> {
  return new classes.$ZodLiteral({
    value: value,
    typeName: classes.$ZodFirstPartyTypeKind.ZodLiteral,
    message: params?.message,
    checks: [],
    ...processCreateParams(params),
  });
}

export function _enum<U extends string, T extends Readonly<[U, ...U[]]>>(
  values: T,
  params?: RawCreateParams
): classes.$ZodEnum<Writeable<T>>;
function _enum<U extends string, T extends [U, ...U[]]>(
  values: T,
  params?: RawCreateParams
): classes.$ZodEnum<T>;
function _enum(values: [string, ...string[]], params?: RawCreateParams) {
  return new classes.$ZodEnum({
    values,
    typeName: classes.$ZodFirstPartyTypeKind.ZodEnum,
    checks: [],
    ...processCreateParams(params),
  });
}

export function nativeEnum<T extends EnumLike>(
  values: T,
  params?: RawCreateParams
): classes.$ZodNativeEnum<T> {
  return new classes.$ZodNativeEnum({
    values: values,
    typeName: classes.$ZodFirstPartyTypeKind.ZodNativeEnum,
    checks: [],
    ...processCreateParams(params),
  });
}

export function file(params?: RawCreateParams): classes.$ZodFile {
  if (typeof File === "undefined") {
    throw new Error("File is not supported in this environment");
  }
  return new classes.$ZodFile({
    checks: [],
    typeName: classes.$ZodFirstPartyTypeKind.ZodFile,
    checks: [],
    ...processCreateParams(params),
  });
}

export function promise<T extends core.$ZodType>(
  schema: T,
  params?: RawCreateParams
): classes.$ZodPromise<T> {
  return new classes.$ZodPromise({
    type: schema,
    typeName: classes.$ZodFirstPartyTypeKind.ZodPromise,
    checks: [],
    ...processCreateParams(params),
  });
}

export function effects<I extends core.$ZodType>(
  schema: I,
  effect: Effect<I["~output"]>,
  params?: RawCreateParams
): classes.$ZodEffects<I, I["~output"]> {
  return new classes.$ZodEffects({
    schema,
    typeName: classes.$ZodFirstPartyTypeKind.ZodEffects,
    effect,
    checks: [],
    ...processCreateParams(params),
  });
}

function effectWithPreprocess<I extends core.$ZodType>(
  preprocess: (arg: unknown, ctx: $RefinementCtx) => unknown,
  schema: I,
  params?: RawCreateParams
): classes.$ZodEffects<I, I["~output"], unknown> {
  return new classes.$ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: classes.$ZodFirstPartyTypeKind.ZodEffects,
    checks: [],
    ...processCreateParams(params),
  });
}

function optional<T extends core.$ZodType>(
  type: T,
  params?: RawCreateParams
): classes.$ZodOptional<T> {
  return new classes.$ZodOptional({
    innerType: type,
    typeName: classes.$ZodFirstPartyTypeKind.ZodOptional,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function nullable<T extends core.$ZodType>(
  type: T,
  params?: RawCreateParams
): classes.$ZodNullable<T> {
  return new classes.$ZodNullable({
    innerType: type,
    typeName: classes.$ZodFirstPartyTypeKind.ZodNullable,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function _default<T extends core.$ZodType>(
  type: T,
  params: RawCreateParams & {
    default: core.input<T> | (() => types.noUndefined<core.input<T>>);
  }
): classes.$ZodDefault<T> {
  return new classes.$ZodDefault({
    innerType: type,
    typeName: classes.$ZodFirstPartyTypeKind.ZodDefault,
    defaultValue:
      typeof params.default === "function"
        ? params.default
        : ((() => params.default) as any),
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

export function _catch<T extends core.$ZodType>(
  type: T,
  params: RawCreateParams & {
    catch: T["~output"] | (() => T["~output"]);
  }
): classes.$ZodCatch<T> {
  return new classes.$ZodCatch({
    innerType: type,
    typeName: classes.$ZodFirstPartyTypeKind.ZodCatch,
    catchValue:
      typeof params.catch === "function"
        ? params.catch
        : ((() => params.catch) as any),
    checks: [],
    ...processCreateParams(params),
  });
}

export function nan(params?: RawCreateParams): classes.$ZodNaN {
  return new classes.$ZodNaN({
    typeName: classes.$ZodFirstPartyTypeKind.ZodNaN,
    checks: [],
    ...processCreateParams(params),
  });
}

export function pipeline<A extends core.$ZodType, B extends core.$ZodType>(
  a: A,
  b: B
): classes.$ZodPipeline<A, B> {
  return new classes.$ZodPipeline({
    in: a,
    out: b,
    typeName: classes.$ZodFirstPartyTypeKind.ZodPipeline,
  });
}

export function readonly<T extends core.$ZodType>(
  type: T,
  params?: RawCreateParams
): classes.$ZodReadonly<T> {
  return new classes.$ZodReadonly({
    innerType: type,
    typeName: classes.$ZodFirstPartyTypeKind.ZodReadonly,
    checks: [],
    ...processCreateParams(params),
  }) as any;
}

function templateLiteral<
  Part extends TemplateLiteralPart,
  Parts extends [] | [Part, ...Part[]],
>(
  parts: Parts,
  params?: RawCreateParams & { coerce?: true }
): classes.$ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
function templateLiteral(
  parts: TemplateLiteralPart[],
  params?: RawCreateParams & { coerce?: true }
) {
  return classes.$ZodTemplateLiteral.empty(params)._addParts(parts) as any;
}
