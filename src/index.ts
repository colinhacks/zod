/* ZOD */

import { ZodString, ZodStringDef } from './types/string';
import { ZodNumber, ZodNumberDef } from './types/number';
import { ZodBigInt, ZodBigIntDef } from './types/bigint';
import { ZodBoolean, ZodBooleanDef } from './types/boolean';
import { ZodDate, ZodDateDef } from './types/date';
import { ZodUndefined, ZodUndefinedDef } from './types/undefined';
import { ZodNull, ZodNullDef } from './types/null';
import { ZodAny, ZodAnyDef } from './types/any';
import { ZodUnknown, ZodUnknownDef } from './types/unknown';
import { ZodVoid, ZodVoidDef } from './types/void';
import { ZodArray, ZodArrayDef } from './types/array';
import { ZodObject, ZodObjectDef } from './types/object';
import { ZodUnion, ZodUnionDef } from './types/union';
import { ZodIntersection, ZodIntersectionDef } from './types/intersection';
import { ZodTuple, ZodTupleDef } from './types/tuple';
import { ZodRecord, ZodRecordDef } from './types/record';
import { ZodFunction, ZodFunctionDef } from './types/function';
import { ZodLazy, ZodLazyDef } from './types/lazy';
import { ZodLiteral, ZodLiteralDef } from './types/literal';
import { ZodEnum, ZodEnumDef } from './types/enum';
import { ZodNativeEnum, ZodNativeEnumDef } from './types/nativeEnum';
import { ZodPromise, ZodPromiseDef } from './types/promise';
import { TypeOf, ZodType, ZodTypeAny, ZodTypeDef, ZodTypes } from './types/base';
import { ZodError, ZodErrorCode } from './ZodError';
import { ZodParsedType } from './parser';

import { ZodErrorMap } from './defaultErrorMap';

import { ZodCodeGenerator } from './codegen';

export { ZodTypeDef, ZodTypes };
type ZodDef =
  | ZodStringDef
  | ZodNumberDef
  | ZodBigIntDef
  | ZodBooleanDef
  | ZodDateDef
  | ZodUndefinedDef
  | ZodNullDef
  | ZodAnyDef
  | ZodUnknownDef
  | ZodVoidDef
  | ZodArrayDef
  | ZodObjectDef
  | ZodUnionDef
  | ZodIntersectionDef
  | ZodTupleDef
  | ZodRecordDef
  | ZodFunctionDef
  | ZodLazyDef
  | ZodLiteralDef
  | ZodEnumDef
  | ZodNativeEnumDef
  | ZodPromiseDef;

const stringType = ZodString.create;
const numberType = ZodNumber.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const unionType = ZodUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

const codegen = ZodCodeGenerator.create;

const custom = <T>(check: (data: unknown) => any, params?: Parameters<ZodAny['refine']>[1]): ZodType<T> =>
  anyType().refine(check, params);

const instanceOfType = <T extends new (...args: any[]) => any>(
  cls: T,
  params: Parameters<ZodAny['refine']>[1] = { message: `Input not instance of ${cls.name}` },
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
  voidType as void,
  arrayType as array,
  objectType as object,
  unionType as union,
  intersectionType as intersection,
  tupleType as tuple,
  recordType as record,
  functionType as function,
  lazyType as lazy,
  literalType as literal,
  enumType as enum,
  nativeEnumType as nativeEnum,
  promiseType as promise,
  instanceOfType as instanceof,
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
  ZodType,
  ZodType as Schema,
  ZodType as ZodSchema,
  ZodTypeAny,
  ZodDef,
  ZodError,
  ZodErrorMap,
  ZodErrorCode,
  ZodParsedType,
  ZodCodeGenerator,
};

export { TypeOf, TypeOf as infer };
