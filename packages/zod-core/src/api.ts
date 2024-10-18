// import * as checks from "./checks.js";
// import type * as core from "./core.js";
// import type * as err from "./errors.js";
// import * as schemas from "./schemas.js";
// import type * as types from "./types.js";

// /*
// ZodType
//   .refine
//   .superRefine
//   .transform
//   .default
//   .describe
//   .catch
//   .optional
//   .nullable
//   .nullish
//   .array
//   .promise
//   .or
//   .and
//   .brand
//   .readonly
//   .pipe
// ZodObject
//   .shape
//   .keyof
//   .extend
//   .merge
//   .pick/.omit
//   .partial
//   .deepPartial
//   .required
//   .passthrough
//   .strict
//   .strip
//   .catchall
// */
// export interface $RawCreateParams {
//   error?: string | err.$ZodErrorMap | undefined;
//   description?: string | undefined;
//   [k: string]: unknown;
// }

// export type $ProcessedCreateParams = {
//   error?: err.$ZodErrorMap | undefined;
//   description?: string | undefined;
// };

// export function processCreateParams<T extends $RawCreateParams>(
//   params?: T | undefined
// ): $ProcessedCreateParams {
//   const processed: $ProcessedCreateParams = {};
//   if (!params) return processed;
//   const { error: _error, description, ...rest } = params;
//   if (_error)
//     processed.error = typeof _error === "string" ? () => _error : _error;
//   if (description) processed.description = description;
//   Object.assign(processed, rest);
//   return processed;
// }

// function splitChecksAndParams<T extends $RawCreateParams>(
//   _paramsOrChecks?: T | unknown[],
//   _checks?: unknown[]
// ): {
//   checks: core.$ZodCheck<any>[];
//   params: T;
// } {
//   console.log({ _paramsOrChecks, _checks });
//   const params: object = Array.isArray(_paramsOrChecks)
//     ? {}
//     : _paramsOrChecks ?? {};
//   const checks: any[] = Array.isArray(_paramsOrChecks)
//     ? _paramsOrChecks
//     : _checks ?? [];
//   return {
//     checks,
//     params: params as T,
//   };
// }

// // declare const z: any;

// // z.string([
// //   z.min(5, "minimum is five"),
// //   z.max(10, "maxiumum is ten!")
// // ], { description: "asdf", error: "Not valid!" });

// // z.string({ description: "asdf", error: "Not valid!" }, [
// //   z.min(5, "minimum is five"),
// //   z.max(10, "maxiumum is ten!")
// // ]);

// // z.string({}).refine([z.min(5), z.max(10)]);

// ////////////////////////////////////////////
// //////////      SCHEMA TYPES      //////////
// ////////////////////////////////////////////
// interface PrimitiveFactory<
//   Params extends $RawCreateParams,
//   T extends core.$ZodType,
// > {
//   (): T;
//   (checks: core.$ZodCheck<core.output<T>>[]): T;
//   (params: Params, checks?: core.$ZodCheck<core.output<T>>[]): T;
// }

// const factory: <Params extends $RawCreateParams, T extends core.$ZodType>(
//   Cls: any,
//   defaultParams: Omit<T["_def"], "checks" | "description" | "error">
// ) => PrimitiveFactory<Params, T> = (Cls, defaultParams) => {
//   return <T extends core.$ZodType>(...args: any[]) => {
//     console.log(...args);
//     const { checks, params } = splitChecksAndParams(...args);
//     console.log({ checks, params });
//     return new Cls({
//       ...defaultParams,
//       checks,
//       ...processCreateParams(params),
//     }) as T;
//   };
// };

// //////////////////   $ZodString   //////////////////
// interface $PrimitiveParams extends $RawCreateParams {
//   coerce?: true;
// }

// interface $ZodStringParams extends $PrimitiveParams {}
// export const string: PrimitiveFactory<$ZodStringParams, schemas.$ZodString> =
//   factory(schemas.$ZodString, {
//     type: "string",
//     coerce: false,
//   });

// interface $ZodNumberParams extends $PrimitiveParams {}
// export const number: PrimitiveFactory<$ZodNumberParams, schemas.$ZodNumber> =
//   factory(schemas.$ZodNumberFast, {
//     type: "number",
//     coerce: false,
//   });

// interface $ZodBooleanParams extends $PrimitiveParams {}
// export const boolean: PrimitiveFactory<$ZodBooleanParams, schemas.$ZodBoolean> =
//   factory(schemas.$ZodBoolean, {
//     type: "boolean",
//     coerce: false,
//   });

// // $ZodBigInt
// interface $ZodBigIntParams extends $PrimitiveParams {}
// export const bigint: PrimitiveFactory<$ZodBigIntParams, schemas.$ZodBigInt> =
//   factory(schemas.$ZodBigInt, {
//     type: "bigint",
//     coerce: false,
//   });

// // $ZodSymbol
// interface $ZodSymbolParams extends $RawCreateParams {}
// export const symbol: PrimitiveFactory<$ZodSymbolParams, schemas.$ZodSymbol> =
//   factory(schemas.$ZodSymbol, {
//     type: "symbol",
//   });

// // $ZodDate
// interface $ZodDateParams extends $PrimitiveParams {}
// export const date: PrimitiveFactory<$ZodDateParams, schemas.$ZodDate> = factory(
//   schemas.$ZodDate,
//   {
//     type: "date",
//     coerce: false,
//   }
// );

// // $ZodUndefined
// interface $ZodUndefinedParams extends $RawCreateParams {}
// const _undefined: PrimitiveFactory<$ZodUndefinedParams, schemas.$ZodUndefined> =
//   factory(schemas.$ZodUndefined, {
//     type: "undefined",
//   });
// export { _undefined as undefined };

// // $ZodNull
// interface $ZodNullParams extends $RawCreateParams {}
// export const _null: PrimitiveFactory<$ZodNullParams, schemas.$ZodNull> =
//   factory(schemas.$ZodNull, {
//     type: "null",
//   });
// export { _null as null };

// // $ZodAny
// interface $ZodAnyParams extends $RawCreateParams {}
// export const any: PrimitiveFactory<$ZodAnyParams, schemas.$ZodAny> = factory(
//   schemas.$ZodAny,
//   {
//     type: "any",
//   }
// );

// // $ZodUnknown
// interface $ZodUnknownParams extends $RawCreateParams {}
// export const unknown: PrimitiveFactory<$ZodUnknownParams, schemas.$ZodUnknown> =
//   factory(schemas.$ZodUnknown, {
//     type: "unknown",
//   });

// // $ZodNever
// interface $ZodNeverParams extends $RawCreateParams {}
// export const never: PrimitiveFactory<$ZodNeverParams, schemas.$ZodNever> =
//   factory(schemas.$ZodNever, {
//     type: "never",
//   });

// // $ZodVoid
// interface $ZodVoidParams extends $RawCreateParams {}
// export const _void: PrimitiveFactory<$ZodVoidParams, schemas.$ZodVoid> =
//   factory(schemas.$ZodVoid, {
//     type: "void",
//   });
// export { _void as void };

// // $ZodArray
// interface $ZodArrayParams extends $RawCreateParams {}
// export function array<T extends core.$ZodType>(
//   schema: T,
//   params?: $ZodArrayParams
// ): schemas.$ZodArray<T> {
//   return new schemas.$ZodArray({
//     type: "array",
//     items: schema as T,
//     ...processCreateParams(params),
//   }) as schemas.$ZodArray<T>;
// }

// // $ZodObject
// interface $ZodObjectParams extends $RawCreateParams {
//   catchall?: core.$ZodType;
// }

// export function object<T extends schemas.$ZodRawShape>(
//   properties: T,
//   params?: $ZodObjectParams
// ): schemas.$ZodObject<T> {
//   const def: schemas.$ZodObjectDef = {
//     type: "object",
//     properties,
//     ...processCreateParams(params),
//   };

//   return new schemas.$ZodObject(def) as schemas.$ZodObject<T>;
// }

// // $ZodUnion

// // $ZodDiscriminatedUnion

// // $ZodIntersection

// // $ZodTuple

// // $ZodRecord

// // $ZodMap

// // $ZodSet

// // $ZodEnum

// // $ZodLiteral

// // $ZodNativeEnum

// // $ZodFile

// // $ZodTransform

// // $ZodOptional

// // $ZodNullable

// // $ZodDefault

// // $ZodCatch

// // $ZodNaN

// // $ZodPipeline

// // $ZodReadonly

// // $ZodTemplateLiteral

// // export function bigint(
// //   params?: RawCreateParams & { coerce?: boolean }
// // ): classes.$ZodBigInt {
// //   return new classes.$ZodBigInt({
// //     checks: [],
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodBigInt,
// //     coerce: params?.coerce ?? false,
// //     ...processCreateParams(params),
// //   });
// // }

// // export function boolean(
// //   params?: RawCreateParams & { coerce?: boolean }
// // ): classes.$ZodBoolean {
// //   return new classes.$ZodBoolean({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodBoolean,
// //     coerce: params?.coerce || false,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function date(
// //   params?: RawCreateParams & { coerce?: boolean }
// // ): classes.$ZodDate {
// //   return new classes.$ZodDate({
// //     coerce: params?.coerce || false,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodDate,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function symbol(params?: RawCreateParams): classes.$ZodSymbol {
// //   return new classes.$ZodSymbol({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodSymbol,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function _undefined(params?: RawCreateParams): classes.$ZodUndefined {
// //   return new classes.$ZodUndefined({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodUndefined,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function _null(params?: RawCreateParams): classes.$ZodNull {
// //   return new classes.$ZodNull({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodNull,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function any(params?: RawCreateParams): classes.$ZodAny {
// //   return new classes.$ZodAny({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodAny,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function unknown(params?: RawCreateParams): classes.$ZodUnknown {
// //   return new classes.$ZodUnknown({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodUnknown,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function never(params?: RawCreateParams): classes.$ZodNever {
// //   return new classes.$ZodNever({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodNever,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function _void(params?: RawCreateParams): classes.$ZodVoid {
// //   return new classes.$ZodVoid({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodVoid,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function array<T extends core.$ZodType>(
// //   schema: T,
// //   params?: RawCreateParams
// // ): classes.$ZodArray<T> {
// //   return new classes.$ZodArray({
// //     type: schema,
// //     minLength: null,
// //     maxLength: null,
// //     exactLength: null,
// //     uniqueness: null,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodArray,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function object<T extends classes.$ZodRawShape>(
// //   shape: T,
// //   params?: RawCreateParams
// // ): classes.$ZodObject<
// //   T,
// //   "strip",
// //   core.$ZodType,
// //   objectOutputType<T, core.$ZodType, "strip">,
// //   objectInputType<T, core.$ZodType, "strip">
// // > {
// //   return new classes.$ZodObject({
// //     shape: () => shape,
// //     unknownKeys: "strip",
// //     catchall: classes.$ZodNever.create(),
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // function objectStrict<T extends classes.$ZodRawShape>(
// //   shape: T,
// //   params?: RawCreateParams
// // ): classes.$ZodObject<T, "strict"> {
// //   return new classes.$ZodObject({
// //     shape: () => shape,
// //     unknownKeys: "strict",
// //     catchall: classes.$ZodNever.create(),
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function objectLazy<T extends classes.$ZodRawShape>(
// //   shape: () => T,
// //   params?: RawCreateParams
// // ): classes.$ZodObject<T, "strip"> {
// //   return new classes.$ZodObject({
// //     shape,
// //     unknownKeys: "strip",
// //     catchall: classes.$ZodNever.create(),
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodObject,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function union<
// //   T extends Readonly<[$ZodType, core.$ZodType, ...$ZodType[]]>,
// // >(types: T, params?: RawCreateParams): classes.$ZodUnion<T> {
// //   return new classes.$ZodUnion({
// //     options: types,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodUnion,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }
// // /**
// //  * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
// //  * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
// //  * have a different value for each object in the union.
// //  * @param discriminator the name of the discriminator property
// //  * @param types an array of object schemas
// //  * @param params
// //  */
// // function discriminatedUnion<
// //   Discriminator extends string,
// //   Types extends [
// //     classes.$ZodDiscriminatedUnionOption<Discriminator>,
// //     ...$ZodDiscriminatedUnionOption<Discriminator>[],
// //   ],
// // >(
// //   discriminator: Discriminator,
// //   options: Types,
// //   params?: RawCreateParams
// // ): classes.$ZodDiscriminatedUnion<Discriminator, Types> {
// //   // Get all the valid discriminator values
// //   const optionsMap: Map<types.Primitive, Types[number]> = new Map();

// //   // try {
// //   for (const type of options) {
// //     const discriminatorValues = getDiscriminator(type.shape[discriminator]);
// //     if (!discriminatorValues.length) {
// //       throw new Error(
// //         `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
// //       );
// //     }
// //     for (const value of discriminatorValues) {
// //       if (optionsMap.has(value)) {
// //         throw new Error(
// //           `Discriminator property ${String(
// //             discriminator
// //           )} has duplicate value ${String(value)}`
// //         );
// //       }

// //       optionsMap.set(value, type);
// //     }
// //   }

// //   return new classes.$ZodDiscriminatedUnion<
// //     Discriminator,
// //     // DiscriminatorValue,
// //     Types
// //   >({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
// //     discriminator,
// //     options,
// //     optionsMap,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function intersection<T extends core.$ZodType, U extends core.$ZodType>(
// //   left: T,
// //   right: U,
// //   params?: RawCreateParams
// // ): classes.$ZodIntersection<T, U> {
// //   return new classes.$ZodIntersection({
// //     left: left,
// //     right: right,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodIntersection,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function tuple<T extends [$ZodType, ...$ZodType[]] | []>(
// //   schemas: T,
// //   params?: RawCreateParams
// // ): classes.$ZodTuple<T, null> {
// //   if (!Array.isArray(schemas)) {
// //     throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
// //   }
// //   return new classes.$ZodTuple({
// //     items: schemas,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodTuple,
// //     rest: null,

// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function record<Value extends core.$ZodType>(
// //   valueType: Value,
// //   params?: RawCreateParams
// // ): classes.$ZodRecord<ZodString, Value>;
// // function record<Keys extends KeySchema, Value extends core.$ZodType>(
// //   keySchema: Keys,
// //   valueType: Value,
// //   params?: RawCreateParams
// // ): classes.$ZodRecord<Keys, Value>;
// // function record(
// //   first: any,
// //   second?: any,
// //   third?: any
// // ): classes.$ZodRecord<any, any> {
// //   if (second instanceof core.$ZodType) {
// //     return new classes.$ZodRecord({
// //       keyType: first,
// //       valueType: second,
// //       typeName: classes.$ZodFirstPartyTypeKind.ZodRecord,
// //       checks: [],
// //       ...processCreateParams(third),
// //     });
// //   }

// //   return new classes.$ZodRecord({
// //     keyType: classes.$ZodString.create(),
// //     valueType: first,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodRecord,
// //     checks: [],
// //     ...processCreateParams(second),
// //   });
// // }

// // export function map<
// //   Key extends core.$ZodType = core.$ZodType,
// //   Value extends core.$ZodType = core.$ZodType,
// // >(
// //   keyType: Key,
// //   valueType: Value,
// //   params?: RawCreateParams
// // ): classes.$ZodMap<Key, Value> {
// //   return new classes.$ZodMap({
// //     valueType,
// //     keyType,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodMap,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function set<Value extends core.$ZodType = core.$ZodType>(
// //   valueType: Value,
// //   params?: RawCreateParams
// // ): classes.$ZodSet<Value> {
// //   return new classes.$ZodSet({
// //     valueType,
// //     minSize: null,
// //     maxSize: null,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodSet,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function _function(): classes.$ZodFunction<
// //   $ZodTuple<[], classes.$ZodUnknown>,
// //   classes.$ZodUnknown
// // >;
// // function _function<
// //   T extends Any$ZodTuple = classes.$ZodTuple<[], classes.$ZodUnknown>,
// // >(args: T): classes.$ZodFunction<T, classes.$ZodUnknown>;
// // function _function<T extends Any$ZodTuple, U extends core.$ZodType>(
// //   args: T,
// //   returns: U
// // ): classes.$ZodFunction<T, U>;
// // function _function<
// //   T extends Any$ZodTuple = classes.$ZodTuple<[], classes.$ZodUnknown>,
// //   U extends core.$ZodType = classes.$ZodUnknown,
// // >(args: T, returns: U, params?: RawCreateParams): classes.$ZodFunction<T, U>;
// // function _function(
// //   args?: Any$ZodTuple,
// //   returns?: core.$ZodType,
// //   params?: RawCreateParams
// // ) {
// //   return new classes.$ZodFunction({
// //     args: (args
// //       ? args
// //       : classes.$ZodTuple.create([]).rest(ZodUnknown.create())) as any,
// //     returns: returns || classes.$ZodUnknown.create(),
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodFunction,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function lazy<T extends core.$ZodType>(
// //   getter: () => T,
// //   params?: RawCreateParams
// // ): classes.$ZodLazy<T> {
// //   return new classes.$ZodLazy({
// //     getter: getter,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodLazy,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function literal<T extends types.Primitive>(
// //   value: T,
// //   params?: RawCreateParams & Exclude<types.ErrMessage, string>
// // ): classes.$ZodLiteral<T> {
// //   return new classes.$ZodLiteral({
// //     value: value,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodLiteral,
// //     message: params?.message,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function _enum<U extends string, T extends Readonly<[U, ...U[]]>>(
// //   values: T,
// //   params?: RawCreateParams
// // ): classes.$ZodEnum<Writeable<T>>;
// // function _enum<U extends string, T extends [U, ...U[]]>(
// //   values: T,
// //   params?: RawCreateParams
// // ): classes.$ZodEnum<T>;
// // function _enum(values: [string, ...string[]], params?: RawCreateParams) {
// //   return new classes.$ZodEnum({
// //     values,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodEnum,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function nativeEnum<T extends EnumLike>(
// //   values: T,
// //   params?: RawCreateParams
// // ): classes.$ZodNativeEnum<T> {
// //   return new classes.$ZodNativeEnum({
// //     values: values,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodNativeEnum,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function file(params?: RawCreateParams): classes.$ZodFile {
// //   if (typeof File === "undefined") {
// //     throw new Error("File is not supported in this environment");
// //   }
// //   return new classes.$ZodFile({
// //     checks: [],
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodFile,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function promise<T extends core.$ZodType>(
// //   schema: T,
// //   params?: RawCreateParams
// // ): classes.$ZodPromise<T> {
// //   return new classes.$ZodPromise({
// //     type: schema,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodPromise,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function effects<I extends core.$ZodType>(
// //   schema: I,
// //   effect: Effect<I["~output"]>,
// //   params?: RawCreateParams
// // ): classes.$ZodEffects<I, I["~output"]> {
// //   return new classes.$ZodEffects({
// //     schema,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodEffects,
// //     effect,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // function effectWithPreprocess<I extends core.$ZodType>(
// //   preprocess: (arg: unknown, ctx: $RefinementCtx) => unknown,
// //   schema: I,
// //   params?: RawCreateParams
// // ): classes.$ZodEffects<I, I["~output"], unknown> {
// //   return new classes.$ZodEffects({
// //     schema,
// //     effect: { type: "preprocess", transform: preprocess },
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodEffects,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // function optional<T extends core.$ZodType>(
// //   type: T,
// //   params?: RawCreateParams
// // ): classes.$ZodOptional<T> {
// //   return new classes.$ZodOptional({
// //     innerType: type,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodOptional,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function nullable<T extends core.$ZodType>(
// //   type: T,
// //   params?: RawCreateParams
// // ): classes.$ZodNullable<T> {
// //   return new classes.$ZodNullable({
// //     innerType: type,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodNullable,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function _default<T extends core.$ZodType>(
// //   type: T,
// //   params: RawCreateParams & {
// //     default: core.input<T> | (() => types.noUndefined<core.input<T>>);
// //   }
// // ): classes.$ZodDefault<T> {
// //   return new classes.$ZodDefault({
// //     innerType: type,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodDefault,
// //     defaultValue:
// //       typeof params.default === "function"
// //         ? params.default
// //         : ((() => params.default) as any),
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // export function _catch<T extends core.$ZodType>(
// //   type: T,
// //   params: RawCreateParams & {
// //     catch: T["~output"] | (() => T["~output"]);
// //   }
// // ): classes.$ZodCatch<T> {
// //   return new classes.$ZodCatch({
// //     innerType: type,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodCatch,
// //     catchValue:
// //       typeof params.catch === "function"
// //         ? params.catch
// //         : ((() => params.catch) as any),
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function nan(params?: RawCreateParams): classes.$ZodNaN {
// //   return new classes.$ZodNaN({
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodNaN,
// //     checks: [],
// //     ...processCreateParams(params),
// //   });
// // }

// // export function pipeline<A extends core.$ZodType, B extends core.$ZodType>(
// //   a: A,
// //   b: B
// // ): classes.$ZodPipeline<A, B> {
// //   return new classes.$ZodPipeline({
// //     in: a,
// //     out: b,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodPipeline,
// //   });
// // }

// // export function readonly<T extends core.$ZodType>(
// //   type: T,
// //   params?: RawCreateParams
// // ): classes.$ZodReadonly<T> {
// //   return new classes.$ZodReadonly({
// //     innerType: type,
// //     typeName: classes.$ZodFirstPartyTypeKind.ZodReadonly,
// //     checks: [],
// //     ...processCreateParams(params),
// //   }) as any;
// // }

// // function templateLiteral<
// //   Part extends TemplateLiteralPart,
// //   Parts extends [] | [Part, ...Part[]],
// // >(
// //   parts: Parts,
// //   params?: $ZodStringParams
// // ): classes.$ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
// // function templateLiteral(
// //   parts: TemplateLiteralPart[],
// //   params?: $ZodStringParams
// // ) {
// //   return classes.$ZodTemplateLiteral.empty(params)._addParts(parts) as any;
// // }

// //////////////////////////////
// ///////    CHECKS     ////////
// //////////////////////////////

// function normalizeCheckParams(
//   params?: string | RawCheckParams
// ): ProcessedCheckParams {
//   if (typeof params === "string") return { error: params } as any;
//   if (!params) return {} as any;
//   return params as any;
// }

// // interface $ZodStringFormat extends $RawCreateParams {
// //   message?:
// //     | string
// //     | err.$ZodErrorMap<
// //         err.$ZodIssueInvalidTypeBasic | err.$ZodInvalidStringIssues
// //       >;
// // }

// interface RawCheckParams {
//   error?: string | err.$ZodErrorMap;
// }
// interface ProcessedCheckParams {
//   error?: err.$ZodErrorMap;
// }

// // $ZodCheckEquals;
// // export function equals<T extends types.Numeric>(
// //   value: T,
// //   params?: string | RawCheckParams
// // ): checks.$ZodCheckEquals<T> {
// //   return new checks.$ZodCheckEquals({
// //     ...normalizeCheckParams(params),
// //     value,
// //   });
// // }

// // $ZodCheckLessThan;
// export function lt<T extends types.Numeric>(
//   value: T,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckLessThan<T> {
//   return new checks.$ZodCheckLessThan({
//     check: "less_than",
//     ...normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function lte<T extends types.Numeric>(
//   value: T,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckLessThan<T> {
//   return new checks.$ZodCheckLessThan({
//     check: "less_than",
//     ...normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }

// // $ZodCheckGreaterThan;
// export function gt<T extends types.Numeric>(
//   value: T,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckGreaterThan<T> {
//   return new checks.$ZodCheckGreaterThan({
//     check: "greater_than",
//     ...normalizeCheckParams(params),
//     value,
//     inclusive: false,
//   });
// }

// export function gte<T extends types.Numeric>(
//   value: T,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckGreaterThan<T> {
//   return new checks.$ZodCheckGreaterThan({
//     check: "greater_than",
//     ...normalizeCheckParams(params),
//     value,
//     inclusive: true,
//   });
// }

// // $ZodCheckMaxSize;
// export function maxSize(
//   maximum: number,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckMaxSize<types.Sizeable> {
//   return new checks.$ZodCheckMaxSize({
//     check: "max_size",
//     ...normalizeCheckParams(params),
//     maximum,
//   });
// }

// // $ZodCheckMinSize;
// export function minSize(
//   minimum: number,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckMinSize<types.Sizeable> {
//   return new checks.$ZodCheckMinSize({
//     check: "min_size",
//     ...normalizeCheckParams(params),
//     minimum,
//   });
// }
// // $ZodCheckRegex;
// export function regex(
//   pattern: RegExp,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckRegex {
//   return new checks.$ZodCheckRegex({
//     check: "string_format",
//     format: "regex",
//     ...normalizeCheckParams(params),
//     pattern,
//   });
// }

// // // $ZodCheckEmail;
// // export function email(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckEmail {
// //   return new checks.$ZodCheckEmail({
// //     check: "email",
// //     ...normalizeCheckParams(params),
// //     pattern: regexes.emailRegex,
// //   });
// // }

// // // $ZodCheckURL;
// // export function url(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckURL {
// //   return new checks.$ZodCheckURL({
// //     check: "url",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckJWT;
// // interface $ZodCheckJWTParams extends RawCheckParams {
// //   algorithm?: types.JWTAlgorithm;
// // }
// // export function jwt(params?: string | $ZodCheckJWTParams): classes.$ZodJWT {
// //   return new classes.$ZodJWT({
// //     check: "jwt",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckEmoji;
// // export function emoji(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckEmoji {
// //   return new checks.$ZodCheckEmoji({
// //     check: "emoji",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckUUID;
// // export function uuid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckUUID {
// //   return new checks.$ZodCheckUUID({
// //     check: "uuid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckNanoID;
// // export function nanoid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckNanoID {
// //   return new checks.$ZodCheckNanoID({
// //     check: "nanoid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckGUID;
// // export function guid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckGUID {
// //   return new checks.$ZodCheckGUID({
// //     check: "guid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckCUID;
// // export function cuid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckCUID {
// //   return new checks.$ZodCheckCUID({
// //     check: "cuid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckCUID2;
// // export function cuid2(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckCUID2 {
// //   return new checks.$ZodCheckCUID2({
// //     check: "cuid2",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckULID;
// // export function ulid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckULID {
// //   return new checks.$ZodCheckULID({
// //     check: "ulid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckXID;
// // export function xid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckXID {
// //   return new checks.$ZodCheckXID({
// //     check: "xid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckKSUID;
// // export function ksuid(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckKSUID {
// //   return new checks.$ZodCheckKSUID({
// //     check: "ksuid",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckDuration;
// // export function duration(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckDuration {
// //   return new checks.$ZodCheckDuration({
// //     check: "duration",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckIP;
// // export function ip(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckIP {
// //   return new checks.$ZodCheckIP({
// //     check: "ip",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckIPv4;
// // export function ipv4(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckIPv4 {
// //   return new checks.$ZodCheckIPv4({
// //     check: "ipv4",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckIPv6;
// // export function ipv6(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckIPv6 {
// //   return new checks.$ZodCheckIPv6({
// //     check: "ipv6",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckBase64;
// // export function base64(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckBase64 {
// //   return new checks.$ZodCheckBase64({
// //     check: "base64",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckJSON;
// // export function json(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckJSONString {
// //   return new checks.$ZodCheckJSONString({
// //     check: "json",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // // $ZodCheckE164;
// // export function e164(params?: string | $ZodCheckStringFormatParams): checks.$ZodCheckE164 {
// //   return new checks.$ZodCheckE164({
// //     check: "e164",
// //     ...normalizeCheckParams(params),
// //   });
// // }

// // $ZodCheckISODateTime;
// // $ZodCheckISODate;
// // $ZodCheckISOTime;
// export * as iso from "./iso.js";

// ///////////////////////////////////////////
// //////    ADDITIONAL STRING CHECKS   //////
// ///////////////////////////////////////////
// // $ZodCheckIncludes;
// export function includes(
//   includes: string,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckIncludes {
//   return new checks.$ZodCheckIncludes({
//     check: "includes",
//     ...normalizeCheckParams(params),
//     includes,
//   });
// }

// // $ZodCheckStartsWith;
// export function startsWith(
//   prefix: string,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckStartsWith {
//   return new checks.$ZodCheckStartsWith({
//     check: "starts_with",
//     ...normalizeCheckParams(params),
//     prefix,
//   });
// }

// // $ZodCheckEndsWith;
// export function endsWith(
//   suffix: string,
//   params?: string | RawCheckParams
// ): checks.$ZodCheckEndsWith {
//   return new checks.$ZodCheckEndsWith({
//     check: "ends_with",
//     ...normalizeCheckParams(params),
//     suffix,
//   });
// }

// /////////////////////////////////////////
// ///////     STRING TRANSFORMS     ///////
// /////////////////////////////////////////
// // $ZodCheckTrim;
// export function trim(params?: string | RawCheckParams): checks.$ZodCheckTrim {
//   return new checks.$ZodCheckTrim({
//     check: "trim",
//     ...normalizeCheckParams(params),
//   });
// }

// // $ZodCheckToLowerCase;
// export function toLowerCase(
//   params?: string | RawCheckParams
// ): checks.$ZodCheckToLowerCase {
//   return new checks.$ZodCheckToLowerCase({
//     check: "to_lowercase",
//     ...normalizeCheckParams(params),
//   });
// }

// // $ZodCheckToUpperCase;
// export function toUpperCase(
//   params?: string | RawCheckParams
// ): checks.$ZodCheckToUpperCase {
//   return new checks.$ZodCheckToUpperCase({
//     check: "to_uppercase",
//     ...normalizeCheckParams(params),
//   });
// }

// // $ZodCheckNormalize;
// export function normalize(
//   params?: string | RawCheckParams
// ): checks.$ZodCheckNormalize {
//   return new checks.$ZodCheckNormalize({
//     check: "normalize",
//     ...normalizeCheckParams(params),
//   });
// }
