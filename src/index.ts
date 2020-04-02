/* ZOD */

import { ZodString, ZodStringDef } from './types/string';
import { ZodNumber, ZodNumberDef } from './types/number';
import { ZodBoolean, ZodBooleanDef } from './types/boolean';
import { ZodUndefined, ZodUndefinedDef } from './types/undefined';
import { ZodNull, ZodNullDef } from './types/null';
import { ZodArray, ZodArrayDef } from './types/array';
import { ZodObject, ZodObjectDef } from './types/object';
import { ZodUnion, ZodUnionDef } from './types/union';
import { ZodIntersection, ZodIntersectionDef } from './types/intersection';
import { ZodTuple, ZodTupleDef } from './types/tuple';
import { ZodFunction } from './types/function';
import { ZodLazy, ZodLazyDef } from './types/lazy';
import { ZodLiteral, ZodLiteralDef } from './types/literal';
import { ZodEnum, ZodEnumDef } from './types/enum';
import { TypeOf, ZodType, ZodAny } from './types/base';
import { ZodError } from './ZodError';

type ZodDef =
  | ZodStringDef
  | ZodNumberDef
  | ZodBooleanDef
  | ZodUndefinedDef
  | ZodNullDef
  | ZodArrayDef
  | ZodObjectDef
  | ZodUnionDef
  | ZodIntersectionDef
  | ZodTupleDef
  // | ZodFunctionDef
  | ZodLazyDef
  | ZodLiteralDef
  | ZodEnumDef;

const stringType = ZodString.create;
const numberType = ZodNumber.create;
const booleanType = ZodBoolean.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const unionType = ZodUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
// const recursionType = ZodObject.recursion;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();

export {
  stringType as string,
  numberType as number,
  booleanType as boolean,
  undefinedType as undefined,
  nullType as null,
  arrayType as array,
  objectType as object,
  unionType as union,
  intersectionType as intersection,
  tupleType as tuple,
  functionType as function,
  lazyType as lazy,
  // recursionType as recursion,
  literalType as literal,
  enumType as enum,
  ostring,
  onumber,
  oboolean,
};

export {
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodUndefined,
  ZodNull,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodIntersection,
  ZodTuple,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodType,
  ZodAny,
  ZodDef,
  ZodError,
};

export { TypeOf, TypeOf as Infer };
