import { expectTypeOf, test } from "vitest";

import * as z from "zod/mini";

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
  z.nullable(z.string()) satisfies z.core.$ZodNullable;

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
  z.optional(z.string()) satisfies z.core.$ZodOptional;

  // $ZodDefault
  z._default(z.string(), "default") satisfies z.core.$ZodDefault;

  // $ZodTemplateLiteral
  z.templateLiteral([z.literal("a"), z.literal("b")]) satisfies z.core.$ZodTemplateLiteral;

  // $ZodCustom
  z.custom<string>((val) => typeof val === "string") satisfies z.core.$ZodCustom;

  // $ZodTransform
  z.transform((val) => val as string) satisfies z.core.$ZodTransform;

  // $ZodNonOptional
  z.nonoptional(z.optional(z.string())) satisfies z.core.$ZodNonOptional;

  // $ZodReadonly
  z.readonly(z.object({ key: z.string() })) satisfies z.core.$ZodReadonly;

  // $ZodNaN
  z.nan() satisfies z.core.$ZodNaN;

  // $ZodPipe
  z.pipe(z.unknown(), z.number()) satisfies z.core.$ZodPipe;

  // $ZodSuccess
  z.success(z.string()) satisfies z.core.$ZodSuccess;

  // $ZodCatch
  z.catch(z.string(), "fallback") satisfies z.core.$ZodCatch;

  // $ZodFile
  z.file() satisfies z.core.$ZodFile;
});

test("schemaForType", () => {
  type Company = {
    id: string;
    name: string;
    webAddress: string | null;
  };

  const CompanySchema = z.object({
    id: z.string(),
    name: z.string(),
    webAddress: z.nullable(z.string()),
  });
  const Company = z.schemaForType<Company>()(CompanySchema);

  expectTypeOf<z.output<typeof Company>>().toEqualTypeOf<Company>();

  const CoreCompany = z.core.schemaForType<Company>()(CompanySchema);
  expectTypeOf<z.output<typeof CoreCompany>>().toEqualTypeOf<Company>();

  const UtilCompany = z.core.util.schemaForType<Company>()(CompanySchema);
  expectTypeOf<z.output<typeof UtilCompany>>().toEqualTypeOf<Company>();

  const Transformed = z.schemaForType<{ count: number }>()(
    z.object({
      count: z.pipe(
        z.string(),
        z.transform((value) => value.length)
      ),
    })
  );
  expectTypeOf<z.input<typeof Transformed>>().toEqualTypeOf<{ count: string }>();
  expectTypeOf<z.output<typeof Transformed>>().toEqualTypeOf<{ count: number }>();

  z.schemaForType<Company>()(
    // @ts-expect-error missing optional keys still fail exact output matching
    z.object({
      id: z.string(),
      name: z.string(),
    })
  );

  z.schemaForType<Company>()(
    // @ts-expect-error extra keys fail exact output matching
    z.object({
      id: z.string(),
      name: z.string(),
      webAddress: z.nullable(z.string()),
      extra: z.string(),
    })
  );

  z.schemaForType<Company>()(
    // @ts-expect-error wrong property output fails matching
    z.object({
      id: z.number(),
      name: z.string(),
      webAddress: z.nullable(z.string()),
    })
  );
});

test("assignability with type narrowing", () => {
  type _RefinedSchema<T extends z.ZodMiniType<object> | z.ZodMiniUnion> = T extends z.ZodMiniUnion
    ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
    : T extends z.ZodMiniType<object>
      ? RefinedTypeSchema<z.output<T>> // <-- Type instantiation is excessively deep and possibly infinite.
      : never;

  type RefinedTypeSchema<T extends object> = T;

  type RefinedUnionSchema<T extends z.ZodMiniUnion> = T;
});
