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
import { ZodFunction, ZodFunctionDef } from './types/function';
import { ZodLazy, ZodLazyDef } from './types/lazy';
import { TypeOf, ZodType, ZodAny } from './types/base';
import Schema from './schema';

export * from './schema';
export { Schema };

export type ZodDef =
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
  | ZodFunctionDef
  | ZodLazyDef;

const string = ZodString.create;
const number = ZodNumber.create;
const boolean = ZodBoolean.create;
const undefined = ZodUndefined.create;
const nullType = ZodNull.create;
const array = ZodArray.create;
const object = ZodObject.create;
const union = ZodUnion.create;
const intersection = ZodIntersection.create;
const tuple = ZodTuple.create;
const functionType = ZodFunction.create;
const lazy = ZodLazy.create;
const ostring = () => string();
const onumber = () => number();
const oboolean = () => boolean();

export {
  string,
  number,
  boolean,
  undefined,
  nullType as null,
  array,
  object,
  union,
  intersection,
  tuple,
  functionType as function,
  lazy,
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
  ZodType,
  ZodAny,
};

export { TypeOf };
