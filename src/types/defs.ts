import type { ZodAnyDef } from "./any";
import type { ZodArrayDef } from "./array";
import type { ZodBigIntDef } from "./bigint";
import type { ZodBooleanDef } from "./boolean";
import type { ZodDateDef } from "./date";
import type { ZodEnumDef } from "./enum";
import type { ZodFunctionDef } from "./function";
import type { ZodIntersectionDef } from "./intersection";
import type { ZodLazyDef } from "./lazy";
import type { ZodLiteralDef } from "./literal";
import type { ZodMapDef } from "./map";
import type { ZodNativeEnumDef } from "./nativeEnum";
import type { ZodNeverDef } from "./never";
import type { ZodNullDef } from "./null";
import type { ZodNullableDef } from "./nullable";
import type { ZodNumberDef } from "./number";
import type { ZodObjectDef } from "./object";
import type { ZodOptionalDef } from "./optional";
import type { ZodPromiseDef } from "./promise";
import type { ZodRecordDef } from "./record";
import type { ZodStringDef } from "./string";
import type { ZodEffectsDef as ZodTransformerDef } from "./transformer";
import type { ZodTupleDef } from "./tuple";
import type { ZodUndefinedDef } from "./undefined";
import type { ZodUnionDef } from "./union";
import type { ZodUnknownDef } from "./unknown";
import type { ZodVoidDef } from "./void";

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
