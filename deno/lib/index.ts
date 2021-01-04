/* ZOD */

import {
  ZodType,
  ZodTypeDef,
  ZodTypeAny,
  ZodRawShape,
  input,
  output,
  TypeOf,
  RefinementCtx,
} from "./types/base.ts";

import { ZodErrorMap } from "./defaultErrorMap.ts";
import { ZodAny } from "./types/any.ts";
import { ZodArray, ZodNonEmptyArray } from "./types/array.ts";
import { ZodBigInt } from "./types/bigint.ts";
import { ZodBoolean } from "./types/boolean.ts";
import { ZodDate } from "./types/date.ts";
import { ZodEnum } from "./types/enum.ts";
import { ZodFunction } from "./types/function.ts";
import { ZodIntersection } from "./types/intersection.ts";
import { ZodLazy } from "./types/lazy.ts";
import { ZodLiteral } from "./types/literal.ts";
import { ZodMap } from "./types/map.ts";
import { ZodNativeEnum } from "./types/nativeEnum.ts";
import { ZodNever } from "./types/never.ts";
import { ZodNull } from "./types/null.ts";
import { ZodNullable, ZodNullableType } from "./types/nullable.ts";
import { ZodNumber } from "./types/number.ts";
import { ZodObject } from "./types/object.ts";
import { ZodOptional, ZodOptionalType } from "./types/optional.ts";
import { ZodPromise } from "./types/promise.ts";
import { ZodRecord } from "./types/record.ts";
import { ZodString } from "./types/string.ts";
import { ZodTransformer } from "./types/transformer.ts";
import { ZodTuple } from "./types/tuple.ts";
import { ZodUndefined } from "./types/undefined.ts";
import { ZodUnion } from "./types/union.ts";
import { ZodUnknown } from "./types/unknown.ts";
import { ZodVoid } from "./types/void.ts";
import { ZodParsedType } from "./ZodParsedType.ts";
import { ZodTypes } from "./ZodTypes.ts";
import { ZodCodeGenerator } from "./codegen.ts";

// export { ZodTypeDef, ZodRawShape, ZodTypes };

const stringType = ZodString.create;
const numberType = ZodNumber.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const unionType = ZodUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const transformerType = ZodTransformer.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();
const codegen = ZodCodeGenerator.create;

export const custom = <T>(
  check?: (data: unknown) => any,
  params?: Parameters<ZodTypeAny["refine"]>[1]
): ZodType<T> => {
  if (check) return anyType().refine(check, params);
  return anyType();
};

const instanceOfType = <T extends new (...args: any[]) => any>(
  cls: T,
  params: Parameters<ZodTypeAny["refine"]>[1] = {
    message: `Input not instance of ${cls.name}`,
  }
) => custom<InstanceType<T>>((data) => data instanceof cls, params);

export type {
  ZodTypeDef,
  ZodRawShape,
  RefinementCtx,
  ZodParsedType,
  TypeOf as infer,
  input,
  output,
  TypeOf,
  ZodErrorMap,
  ZodNullableType,
  ZodOptionalType,
  ZodTypeAny,
};

export {
  ZodType,
  ZodType as Schema,
  ZodType as ZodSchema,
  ZodTypes,
  ZodAny,
  ZodArray,
  ZodNonEmptyArray,
  ZodBigInt,
  ZodBoolean,
  ZodCodeGenerator,
  ZodDate,
  ZodEnum,
  ZodFunction,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodNativeEnum,
  ZodNever,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodRecord,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  codegen,
  dateType as date,
  enumType as enum,
  functionType as function,
  instanceOfType as instanceof,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
  nativeEnumType as nativeEnum,
  neverType as never,
  nullType as null,
  nullableType as nullable,
  numberType as number,
  objectType as object,
  oboolean,
  onumber,
  optionalType as optional,
  ostring,
  promiseType as promise,
  recordType as record,
  stringType as string,
  transformerType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};

export const late = {
  object: ZodObject.lazycreate,
};

export * from "./ZodDef.ts";
export * from "./ZodError.ts";
