/* ZOD */

import { ZodString, ZodStringDef } from './types/string.ts';
import { ZodNumber, ZodNumberDef } from './types/number.ts';
import { ZodBigInt, ZodBigIntDef } from './types/bigint.ts';
import { ZodBoolean, ZodBooleanDef } from './types/boolean.ts';
import { ZodDate, ZodDateDef } from './types/date.ts';
import { ZodUndefined, ZodUndefinedDef } from './types/undefined.ts';
import { ZodNull, ZodNullDef } from './types/null.ts';
import { ZodAny, ZodAnyDef } from './types/any.ts';
import { ZodUnknown, ZodUnknownDef } from './types/unknown.ts';
import { ZodNever, ZodNeverDef } from './types/never.ts';
import { ZodVoid, ZodVoidDef } from './types/void.ts';
import { ZodArray, ZodArrayDef } from './types/array.ts';
import { ZodObject, ZodObjectDef } from './types/object.ts';
import { ZodUnion, ZodUnionDef } from './types/union.ts';
import { ZodIntersection, ZodIntersectionDef } from './types/intersection.ts';
import { ZodTuple, ZodTupleDef } from './types/tuple.ts';
import { ZodRecord, ZodRecordDef } from './types/record.ts';
import { ZodMap, ZodMapDef } from './types/map.ts';
import { ZodFunction, ZodFunctionDef } from './types/function.ts';
import { ZodLazy, ZodLazyDef } from './types/lazy.ts';
import { ZodLiteral, ZodLiteralDef } from './types/literal.ts';
import { ZodEnum, ZodEnumDef } from './types/enum.ts';
import { ZodNativeEnum, ZodNativeEnumDef } from './types/nativeEnum.ts';
import { ZodPromise, ZodPromiseDef } from './types/promise.ts';
import { ZodTransformer, ZodTransformerDef } from './types/transformer.ts';
import { ZodOptional, ZodOptionalDef } from './types/optional.ts';
import { ZodNullable, ZodNullableDef } from './types/nullable.ts';
import {
  TypeOf,
  input,
  output,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
  ZodTypes,
} from './types/base.ts';

// export { ZodIssueCode } from './ZodError';

import { ZodParsedType } from './parser.ts';
import { ZodErrorMap } from './defaultErrorMap.ts';
import { ZodCodeGenerator } from './codegen.ts';

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
  params?: Parameters<ZodTypeAny['refine']>[1],
): ZodType<T> => {
  if (check) return anyType().refine(check, params);
  return anyType();
};

const instanceOfType = <T extends new (...args: any[]) => any>(
  cls: T,
  params: Parameters<ZodTypeAny['refine']>[1] = {
    message: `Input not instance of ${cls.name}`,
  },
) => custom<InstanceType<T>>(data => data instanceof cls, params);

export {
  stringType as string,
  numberType as number,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  undefinedType as undefined,
  nullType as null,
  anyType as any,
  unknownType as unknown,
  neverType as never,
  voidType as void,
  arrayType as array,
  objectType as object,
  unionType as union,
  intersectionType as intersection,
  tupleType as tuple,
  recordType as record,
  mapType as map,
  functionType as function,
  lazyType as lazy,
  literalType as literal,
  enumType as enum,
  nativeEnumType as nativeEnum,
  promiseType as promise,
  instanceOfType as instanceof,
  transformerType as transformer,
  optionalType as optional,
  nullableType as nullable,
  ostring,
  onumber,
  oboolean,
  codegen,
};

export const late = {
  object: ZodObject.lazycreate,
};

export {
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodTransformer,
  ZodOptional,
  ZodNullable,
  ZodParsedType,
  ZodCodeGenerator,
};

export type {
  ZodType,
  ZodType as Schema,
  ZodType as ZodSchema,
  ZodTypeAny,
  ZodErrorMap,
};

export type { TypeOf, TypeOf as infer, input, output };

export * from './ZodError.ts';

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
