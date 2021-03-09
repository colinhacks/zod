import { ZodAnyDef } from "./types/any";
import { ZodArrayDef } from "./types/array";
import { ZodBigIntDef } from "./types/bigint";
import { ZodBooleanDef } from "./types/boolean";
import { ZodDateDef } from "./types/date";
import { ZodEnumDef } from "./types/enum";
import { ZodFunctionDef } from "./types/function";
import { ZodIntersectionDef } from "./types/intersection";
import { ZodLazyDef } from "./types/lazy";
import { ZodLiteralDef } from "./types/literal";
import { ZodMapDef } from "./types/map";
import { ZodSetDef } from "./types/set";
import { ZodNativeEnumDef } from "./types/nativeEnum";
import { ZodNeverDef } from "./types/never";
import { ZodNullDef } from "./types/null";
import { ZodNullableDef } from "./types/nullable";
import { ZodNumberDef } from "./types/number";
import { ZodObjectDef } from "./types/object";
import { ZodOptionalDef } from "./types/optional";
import { ZodPromiseDef } from "./types/promise";
import { ZodRecordDef } from "./types/record";
import { ZodStringDef } from "./types/string";
import { ZodTransformerDef } from "./types/transformer";
import { ZodTupleDef } from "./types/tuple";
import { ZodUndefinedDef } from "./types/undefined";
import { ZodUnionDef } from "./types/union";
import { ZodUnknownDef } from "./types/unknown";
import { ZodVoidDef } from "./types/void";

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
