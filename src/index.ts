/* ZOD */

import { ZodCodeGenerator } from "./codegen";
import { ZodErrorMap } from "./defaultErrorMap";
import { ZodAny } from "./types/any";
import { ZodArray, ZodNonEmptyArray } from "./types/array";
import {
  input,
  output,
  RefinementCtx,
  TypeOf,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
} from "./types/base";
import { ZodBigInt } from "./types/bigint";
import { ZodBoolean } from "./types/boolean";
import { ZodDate } from "./types/date";
import { ZodEnum } from "./types/enum";
import { ZodFunction } from "./types/function";
import { ZodIntersection } from "./types/intersection";
import { ZodLazy } from "./types/lazy";
import { ZodLiteral } from "./types/literal";
import { ZodMap } from "./types/map";
import { ZodNativeEnum } from "./types/nativeEnum";
import { ZodNever } from "./types/never";
import { ZodNull } from "./types/null";
import { ZodNullable, ZodNullableType } from "./types/nullable";
import { ZodNumber } from "./types/number";
import { ZodObject } from "./types/object";
import { ZodOptional, ZodOptionalType } from "./types/optional";
import { ZodPromise } from "./types/promise";
import { ZodRecord } from "./types/record";
import { ZodSet } from "./types/set";
import { ZodString } from "./types/string";
import { ZodTransformer } from "./types/transformer";
import { ZodTuple } from "./types/tuple";
import { ZodUndefined } from "./types/undefined";
import { ZodUnion } from "./types/union";
import { ZodUnknown } from "./types/unknown";
import { ZodVoid } from "./types/void";
import { ZodParsedType } from "./ZodParsedType";
import { ZodTypes } from "./ZodTypes";

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
const setType = ZodSet.create;
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
  TypeOf as infer,
  input,
  output,
  RefinementCtx,
  TypeOf,
  ZodErrorMap,
  ZodNullableType,
  ZodOptionalType,
  ZodParsedType,
  ZodRawShape,
  ZodTypeAny,
  ZodTypeDef,
};

export {
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
  ZodType as Schema,
  setType as set,
  stringType as string,
  transformerType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
  ZodAny,
  ZodArray,
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
  ZodNonEmptyArray,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodRecord,
  ZodType as ZodSchema,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodType,
  ZodTypes,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
};

export const late = {
  object: ZodObject.lazycreate,
};

export * from "./ZodDef";
export * from "./ZodError";
