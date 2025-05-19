import { test } from "vitest";

import * as z from "zod/v4";

test("assignability", () => {
  // $ZodString
  z.string() satisfies z.core.$ZodString;

  // $ZodNumber
  z.number() satisfies z.core.$ZodNumber;

  // $ZodBigInt
  z.bigint() satisfies z.core.$ZodBigInt;

  // $ZodBoolean
  z.boolean() satisfies z.core.$ZodBoolean;

  // $ZodDate
  z.date() satisfies z.core.$ZodDate;

  // $ZodSymbol
  z.symbol() satisfies z.core.$ZodSymbol;

  // $ZodUndefined
  z.undefined() satisfies z.core.$ZodUndefined;

  // $ZodNullable
  z.string().nullable() satisfies z.core.$ZodNullable;

  // $ZodNull
  z.null() satisfies z.core.$ZodNull;

  // $ZodAny
  z.any() satisfies z.core.$ZodAny;

  // $ZodUnknown
  z.unknown() satisfies z.core.$ZodUnknown;

  // $ZodNever
  z.never() satisfies z.core.$ZodNever;

  // $ZodVoid
  z.void() satisfies z.core.$ZodVoid;

  // $ZodArray
  z.array(z.string()) satisfies z.core.$ZodArray;

  // $ZodObject
  z.object({ key: z.string() }) satisfies z.core.$ZodObject;

  // $ZodUnion
  z.union([z.string(), z.number()]) satisfies z.core.$ZodUnion;

  // $ZodIntersection
  z.intersection(z.string(), z.number()) satisfies z.core.$ZodIntersection;

  // $ZodTuple
  z.tuple([z.string(), z.number()]) satisfies z.core.$ZodTuple;

  // $ZodRecord
  z.record(z.string(), z.number()) satisfies z.core.$ZodRecord;

  // $ZodMap
  z.map(z.string(), z.number()) satisfies z.core.$ZodMap;

  // $ZodSet
  z.set(z.string()) satisfies z.core.$ZodSet;

  // $ZodLiteral
  z.literal("example") satisfies z.core.$ZodLiteral;

  // $ZodEnum
  z.enum(["a", "b", "c"]) satisfies z.core.$ZodEnum;

  // $ZodPromise
  z.promise(z.string()) satisfies z.core.$ZodPromise;

  // $ZodLazy
  const lazySchema = z.lazy(() => z.string());
  lazySchema satisfies z.core.$ZodLazy;

  // $ZodOptional
  z.string().optional() satisfies z.core.$ZodOptional;

  // $ZodDefault
  z.string().default("default") satisfies z.core.$ZodDefault;

  // $ZodTemplateLiteral
  z.templateLiteral([z.literal("a"), z.literal("b")]) satisfies z.core.$ZodTemplateLiteral;

  // $ZodCustom
  z.custom<string>((val) => typeof val === "string") satisfies z.core.$ZodCustom;

  // $ZodTransform
  z.transform((val) => val as string) satisfies z.core.$ZodTransform;

  // $ZodNonOptional
  z.string().optional().nonoptional() satisfies z.core.$ZodNonOptional;

  // $ZodReadonly
  z.object({ key: z.string() }).readonly() satisfies z.core.$ZodReadonly;

  // $ZodNaN
  z.nan() satisfies z.core.$ZodNaN;

  // $ZodPipe
  z.unknown().pipe(z.number()) satisfies z.core.$ZodPipe;

  // $ZodSuccess
  z.success(z.string()) satisfies z.core.$ZodSuccess;

  // $ZodCatch
  z.string().catch("fallback") satisfies z.core.$ZodCatch;

  // $ZodFile
  z.file() satisfies z.core.$ZodFile;
});

test("checks", () => {
  const _a: z.core.$ZodCheck = {} as any as z.core.$ZodChecks;
  const _b: z.core.$ZodCheck = {} as any as z.core.$ZodStringFormatChecks;
  const _c: z.core.$ZodType = {} as any as z.core.$ZodTypes;
  const _d: z.core.$ZodType = {} as any as z.core.$ZodStringFormatTypes;
});
