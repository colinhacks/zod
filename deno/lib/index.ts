/* ZOD */

import { ZodCodeGenerator } from "./codegen.ts";
import { ZodErrorMap } from "./defaultErrorMap.ts";
// export { ZodIssueCode } from './ZodError';
import { ZodParsedType } from "./parser.ts";
import { ZodAny, ZodAnyDef } from "./types/any.ts";
import { ZodArray, ZodArrayDef } from "./types/array.ts";
import {
  input,
  output,
  TypeOf,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
  ZodTypes,
} from "./types/base.ts";
import { ZodBigInt, ZodBigIntDef } from "./types/bigint.ts";
import { ZodBoolean, ZodBooleanDef } from "./types/boolean.ts";
import { ZodDate, ZodDateDef } from "./types/date.ts";
import { ZodEnum, ZodEnumDef } from "./types/enum.ts";
import { ZodFunction, ZodFunctionDef } from "./types/function.ts";
import { ZodIntersection, ZodIntersectionDef } from "./types/intersection.ts";
import { ZodLazy, ZodLazyDef } from "./types/lazy.ts";
import { ZodLiteral, ZodLiteralDef } from "./types/literal.ts";
import { ZodMap, ZodMapDef } from "./types/map.ts";
import { ZodNativeEnum, ZodNativeEnumDef } from "./types/nativeEnum.ts";
import { ZodNever, ZodNeverDef } from "./types/never.ts";
import { ZodNull, ZodNullDef } from "./types/null.ts";
import { ZodNullable, ZodNullableDef } from "./types/nullable.ts";
import { ZodNumber, ZodNumberDef } from "./types/number.ts";
import { ZodObject, ZodObjectDef } from "./types/object.ts";
import { ZodOptional, ZodOptionalDef } from "./types/optional.ts";
import { ZodPromise, ZodPromiseDef } from "./types/promise.ts";
import { ZodRecord, ZodRecordDef } from "./types/record.ts";
import { ZodString, ZodStringDef } from "./types/string.ts";
import { ZodTransformer, ZodTransformerDef } from "./types/transformer.ts";
import { ZodTuple, ZodTupleDef } from "./types/tuple.ts";
import { ZodUndefined, ZodUndefinedDef } from "./types/undefined.ts";
import { ZodUnion, ZodUnionDef } from "./types/union.ts";
import { ZodUnknown, ZodUnknownDef } from "./types/unknown.ts";
import { ZodVoid, ZodVoidDef } from "./types/void.ts";

export type { ZodTypeDef };
export { ZodTypes };

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
  enumType as enumeration,
  functionType as fn,
  instanceOfType as instanceOf,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
  nativeEnumType as nativeEnum,
  neverType as never,
  nullableType as nullable,
  nullType as nullValue,
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
  voidType as voidReturn,
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
};

export type {
  ZodErrorMap,
  ZodType,
  ZodTypeAny,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
};

export type { TypeOf as infer, input, output, TypeOf };

export * from "./ZodError.ts";

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
