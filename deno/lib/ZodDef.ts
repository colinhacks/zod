import { ZodAnyDef } from "./types/any.ts";
import { ZodArrayDef } from "./types/array.ts";
import { ZodBigIntDef } from "./types/bigint.ts";
import { ZodBooleanDef } from "./types/boolean.ts";
import { ZodDateDef } from "./types/date.ts";
import { ZodEnumDef } from "./types/enum.ts";
import { ZodFunctionDef } from "./types/function.ts";
import { ZodIntersectionDef } from "./types/intersection.ts";
import { ZodLazyDef } from "./types/lazy.ts";
import { ZodLiteralDef } from "./types/literal.ts";
import { ZodMapDef } from "./types/map.ts";
import { ZodNativeEnumDef } from "./types/nativeEnum.ts";
import { ZodNeverDef } from "./types/never.ts";
import { ZodNullDef } from "./types/null.ts";
import { ZodNullableDef } from "./types/nullable.ts";
import { ZodNumberDef } from "./types/number.ts";
import { ZodObjectDef } from "./types/object.ts";
import { ZodOptionalDef } from "./types/optional.ts";
import { ZodPromiseDef } from "./types/promise.ts";
import { ZodRecordDef } from "./types/record.ts";
import { ZodSetDef } from "./types/set.ts";
import { ZodStringDef } from "./types/string.ts";
import { ZodTransformerDef } from "./types/transformer.ts";
import { ZodTupleDef } from "./types/tuple.ts";
import { ZodUndefinedDef } from "./types/undefined.ts";
import { ZodUnionDef } from "./types/union.ts";
import { ZodUnknownDef } from "./types/unknown.ts";
import { ZodVoidDef } from "./types/void.ts";

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
  | ZodSetDef
  | ZodFunctionDef
  | ZodLazyDef
  | ZodLiteralDef
  | ZodEnumDef
  | ZodTransformerDef
  | ZodNativeEnumDef
  | ZodOptionalDef
  | ZodNullableDef
  | ZodPromiseDef;
