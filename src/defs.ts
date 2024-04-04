import type { ZodAnyDef } from "./types/any";
import type { ZodArrayDef } from "./types/array";
import type { ZodBigIntDef } from "./types/bigint";
import type { ZodBooleanDef } from "./types/boolean";
import type { ZodDateDef } from "./types/date";
import type { ZodEnumDef } from "./types/enum";
import type { ZodFunctionDef } from "./types/function";
import type { ZodIntersectionDef } from "./types/intersection";
import type { ZodLazyDef } from "./types/lazy";
import type { ZodLiteralDef } from "./types/literal";
import type { ZodMapDef } from "./types/map";
import type { ZodNativeEnumDef } from "./types/nativeEnum";
import type { ZodNeverDef } from "./types/never";
import type { ZodNullDef } from "./types/null";
import type { ZodNullableDef } from "./types/nullable";
import type { ZodNumberDef } from "./types/number";
import type { ZodObjectDef } from "./types/object";
import type { ZodOptionalDef } from "./types/optional";
import type { ZodPromiseDef } from "./types/promise";
import type { ZodRecordDef } from "./types/record";
import type { ZodStringDef } from "./types/string";
import type { ZodEffectsDef as ZodTransformerDef } from "./types/transformer";
import type { ZodTupleDef } from "./types/tuple";
import type { ZodUndefinedDef } from "./types/undefined";
import type { ZodUnionDef } from "./types/union";
import type { ZodUnknownDef } from "./types/unknown";
import type { ZodVoidDef } from "./types/void";

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

export enum ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodNaN = "ZodNaN",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
  ZodSymbol = "ZodSymbol",
  ZodUndefined = "ZodUndefined",
  ZodNull = "ZodNull",
  ZodAny = "ZodAny",
  ZodUnknown = "ZodUnknown",
  ZodNever = "ZodNever",
  ZodVoid = "ZodVoid",
  ZodArray = "ZodArray",
  ZodObject = "ZodObject",
  ZodUnion = "ZodUnion",
  ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
  ZodIntersection = "ZodIntersection",
  ZodTuple = "ZodTuple",
  ZodRecord = "ZodRecord",
  ZodMap = "ZodMap",
  ZodSet = "ZodSet",
  ZodFunction = "ZodFunction",
  ZodLazy = "ZodLazy",
  ZodLiteral = "ZodLiteral",
  ZodEnum = "ZodEnum",
  ZodEffects = "ZodEffects",
  ZodNativeEnum = "ZodNativeEnum",
  ZodOptional = "ZodOptional",
  ZodNullable = "ZodNullable",
  ZodDefault = "ZodDefault",
  ZodCatch = "ZodCatch",
  ZodPromise = "ZodPromise",
  ZodBranded = "ZodBranded",
  ZodPipeline = "ZodPipeline",
  ZodTemplateLiteral = "ZodTemplateLiteral",
  ZodReadonly = "ZodReadonly",
}
