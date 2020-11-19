import { ZodStringDef } from './types/string';
import { ZodNumberDef } from './types/number';
import { ZodBigIntDef } from './types/bigint';
import { ZodBooleanDef } from './types/boolean';
import { ZodDateDef } from './types/date';
import { ZodUndefinedDef } from './types/undefined';
import { ZodNullDef } from './types/null';
import { ZodAnyDef } from './types/any';
import { ZodUnknownDef } from './types/unknown';
import { ZodNeverDef } from './types/never';
import { ZodVoidDef } from './types/void';
import { ZodArrayDef } from './types/array';
import { ZodObjectDef } from './types/object';
import { ZodUnionDef } from './types/union';
import { ZodIntersectionDef } from './types/intersection';
import { ZodTupleDef } from './types/tuple';
import { ZodRecordDef } from './types/record';
import { ZodMapDef } from './types/map';
import { ZodFunctionDef } from './types/function';
import { ZodLazyDef } from './types/lazy';
import { ZodLiteralDef } from './types/literal';
import { ZodEnumDef } from './types/enum';
import { ZodNativeEnumDef } from './types/nativeEnum';
import { ZodPromiseDef } from './types/promise';
import { ZodTransformerDef } from './types/transformer';
import { ZodOptionalDef } from './types/optional';
import { ZodNullableDef } from './types/nullable';

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
