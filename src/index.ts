/* ZOD */

import { ZodCodeGenerator } from "./codegen";
import { ZodErrorMap } from "./defaultErrorMap";
// export { ZodIssueCode } from './ZodError';
import { ZodParsedType } from "./parser";
import { ZodAny, ZodAnyDef } from "./types/any";
import { ZodArray, ZodArrayDef } from "./types/array";
import {
  input,
  output,
  TypeOf,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
  ZodTypes,
} from "./types/base";
import { ZodBigInt, ZodBigIntDef } from "./types/bigint";
import { ZodBoolean, ZodBooleanDef } from "./types/boolean";
import { ZodDate, ZodDateDef } from "./types/date";
import { ZodEnum, ZodEnumDef } from "./types/enum";
import { ZodFunction, ZodFunctionDef } from "./types/function";
import { ZodIntersection, ZodIntersectionDef } from "./types/intersection";
import { ZodLazy, ZodLazyDef } from "./types/lazy";
import { ZodLiteral, ZodLiteralDef } from "./types/literal";
import { ZodMap, ZodMapDef } from "./types/map";
import { ZodNativeEnum, ZodNativeEnumDef } from "./types/nativeEnum";
import { ZodNever, ZodNeverDef } from "./types/never";
import { ZodNull, ZodNullDef } from "./types/null";
import { ZodNullable, ZodNullableDef } from "./types/nullable";
import { ZodNumber, ZodNumberDef } from "./types/number";
import { ZodObject, ZodObjectDef } from "./types/object";
import { ZodOptional, ZodOptionalDef } from "./types/optional";
import { ZodPromise, ZodPromiseDef } from "./types/promise";
import { ZodRecord, ZodRecordDef } from "./types/record";
import { ZodString, ZodStringDef } from "./types/string";
import { ZodTransformer, ZodTransformerDef } from "./types/transformer";
import { ZodTuple, ZodTupleDef } from "./types/tuple";
import { ZodUndefined, ZodUndefinedDef } from "./types/undefined";
import { ZodUnion, ZodUnionDef } from "./types/union";
import { ZodUnknown, ZodUnknownDef } from "./types/unknown";
import { ZodVoid, ZodVoidDef } from "./types/void";

export { ZodTypeDef, ZodTypes };

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
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodParsedType,
  ZodPromise,
  ZodRecord,
  ZodType as ZodSchema,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodType,
  ZodTypeAny,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
};

export { TypeOf as infer, input, output, TypeOf };

export * from "./ZodError";

export type ZodDef =
  | ZodStringDef
  | ZodNumberDef
  | ZodBigIntDef
  | ZodBooleanDef
  | ZodDateDef
  | ZodUndefinedDef
  | ZodNullDef
  | ZodAnyDef
  | ZodUnknownDef
  | ZodNeverDef
  | ZodVoidDef
  | ZodArrayDef
  | ZodObjectDef
  | ZodUnionDef
  | ZodIntersectionDef
  | ZodTupleDef
  | ZodRecordDef
  | ZodMapDef
  | ZodFunctionDef
  | ZodLazyDef
  | ZodLiteralDef
  | ZodEnumDef
  | ZodTransformerDef
  | ZodNativeEnumDef
  | ZodOptionalDef
  | ZodNullableDef
  | ZodPromiseDef;
