/* ZOD */

import { ZodAny, ZodAnyDef } from './types/any';
import { ZodArray, ZodArrayDef } from './types/array';
import { TypeOf, ZodType, ZodTypeAny } from './types/base';
import { ZodBigInt, ZodBigIntDef } from './types/bigint';
import { ZodBoolean, ZodBooleanDef } from './types/boolean';
import { ZodDate, ZodDateDef } from './types/date';
import { ZodGeneric, ZodGenericDef } from './types/generic';
import { ZodEnum, ZodEnumDef } from './types/enum';
import { ZodFunction, ZodFunctionDef } from './types/function';
import { ZodIntersection, ZodIntersectionDef } from './types/intersection';
import { ZodLazy, ZodLazyDef } from './types/lazy';
import { ZodLiteral, ZodLiteralDef } from './types/literal';
import { ZodNull, ZodNullDef } from './types/null';
import { ZodNumber, ZodNumberDef } from './types/number';
import { ZodObject, ZodObjectDef } from './types/object';
import { ZodPromise, ZodPromiseDef } from './types/promise';
import { ZodRecord, ZodRecordDef } from './types/record';
import { ZodString, ZodStringDef } from './types/string';
import { ZodTuple, ZodTupleDef } from './types/tuple';
import { ZodUndefined, ZodUndefinedDef } from './types/undefined';
import { ZodUnion, ZodUnionDef } from './types/union';
import { ZodUnknown, ZodUnknownDef } from './types/unknown';
import { ZodError } from './ZodError';

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
  | ZodArrayDef
  | ZodObjectDef
  | ZodUnionDef
  | ZodGenericDef
  | ZodIntersectionDef
  | ZodTupleDef
  | ZodRecordDef
  | ZodFunctionDef
  | ZodLazyDef
  | ZodLiteralDef
  | ZodEnumDef
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
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const unionType = ZodUnion.create;
const genericType = ZodGeneric.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
// const lazyobjectType = ZodLazyObject.create;
// const recursionType = ZodObject.recursion;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const promiseType = ZodPromise.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

// const stringRecord = <T extends ZodTypeAny>(x:T)=>recordType(stringType(),x);
// const stringMap = stringRecord(objectType({asf:stringType()}))
// const stringMap2 = recordType(stringType(),objectType({ asf: stringType() }));

// type Literal = boolean | null | number | string;
// type Json = Literal | { [key: string]: Json } | Json[];

// const Literal = ZodUnion.create([ZodBoolean.create(), ZodNull.create(), ZodNumber.create(), ZodString.create()]);
// const JsonSchema: ZodType<Json> = ZodLazy.create(() =>
//   ZodUnion.create([Literal, ZodArray.create(JsonSchema), ZodRecord.create(JsonSchema)]),
// );
// const jsonType = () => JsonSchema;

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
  arrayType as array,
  objectType as object,
  unionType as union,
  genericType as generic,
  intersectionType as intersection,
  tupleType as tuple,
  recordType as record,
  functionType as function,
  lazyType as lazy,
  // lazyobjectType as lazyobject,
  // recursionType as recursion,
  literalType as literal,
  enumType as enum,
  promiseType as promise,
  // jsonType as json,
  ostring,
  onumber,
  oboolean,
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
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodGeneric,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodFunction,
  ZodLazy,
  // ZodLazyObject,
  ZodLiteral,
  ZodEnum,
  ZodPromise,
  ZodType,
  ZodType as Schema,
  ZodTypeAny,
  ZodError,
};
export { TypeOf, TypeOf as infer };
