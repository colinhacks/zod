/* ZOD */

import { ZodType, ZodTypeDef } from "./types/base/type";
export { ZodTypeDef, ZodTypes };
import { input, output, TypeOf } from "./types/base";
import { ZodErrorMap } from "./defaultErrorMap";
import { ZodAny } from "./types/any";
import { ZodArray } from "./types/array";

import { ZodTypeAny } from "./types/base/type-any";
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
import { ZodString } from "./types/string";
import { ZodTransformer } from "./types/transformer";
import { ZodTuple } from "./types/tuple";
import { ZodUndefined } from "./types/undefined";
import { ZodUnion } from "./types/union";
import { ZodUnknown } from "./types/unknown";
import { ZodVoid } from "./types/void";
// export { ZodIssueCode } from './ZodError';
import { ZodParsedType } from "./ZodParsedType";
import { ZodTypes } from "./ZodTypes";
import { ZodCodeGenerator } from "./codegen";

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

export {
  ZodType as Schema,
  ZodType as ZodSchema,
  // ZodType,
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodCodeGenerator,
  ZodDate,
  ZodEnum,
  ZodErrorMap,
  ZodFunction,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodNativeEnum,
  ZodNever,
  ZodNull,
  ZodNullable,
  ZodNullableType,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodOptionalType,
  ZodParsedType,
  ZodPromise,
  ZodRecord,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodTypeAny,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
};

export { TypeOf as infer, input, output, TypeOf };

export * from "./ZodDef";
export * from "./ZodError";
