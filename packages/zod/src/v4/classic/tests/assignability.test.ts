import { expectTypeOf, test } from "vitest";

import * as z from "zod/v4";
import * as core from "zod/v4/core";

test("assignability", () => {
  // $ZodString
  z.string() satisfies z.core.$ZodString;
  z.string() satisfies z.ZodString;

  // $ZodNumber
  z.number() satisfies z.core.$ZodNumber;
  z.number() satisfies z.ZodNumber;

  // $ZodBigInt
  z.bigint() satisfies z.core.$ZodBigInt;
  z.bigint() satisfies z.ZodBigInt;

  // $ZodBoolean
  z.boolean() satisfies z.core.$ZodBoolean;
  z.boolean() satisfies z.ZodBoolean;

  // $ZodDate
  z.date() satisfies z.core.$ZodDate;
  z.date() satisfies z.ZodDate;

  // $ZodSymbol
  z.symbol() satisfies z.core.$ZodSymbol;
  z.symbol() satisfies z.ZodSymbol;

  // $ZodUndefined
  z.undefined() satisfies z.core.$ZodUndefined;
  z.undefined() satisfies z.ZodUndefined;

  // $ZodNullable
  z.string().nullable() satisfies z.core.$ZodNullable;
  z.string().nullable() satisfies z.ZodNullable;

  // $ZodNull
  z.null() satisfies z.core.$ZodNull;
  z.null() satisfies z.ZodNull;

  // $ZodAny
  z.any() satisfies z.core.$ZodAny;
  z.any() satisfies z.ZodAny;

  // $ZodUnknown
  z.unknown() satisfies z.core.$ZodUnknown;
  z.unknown() satisfies z.ZodUnknown;

  // $ZodNever
  z.never() satisfies z.core.$ZodNever;
  z.never() satisfies z.ZodNever;

  // $ZodVoid
  z.void() satisfies z.core.$ZodVoid;
  z.void() satisfies z.ZodVoid;

  // $ZodArray
  z.array(z.string()) satisfies z.core.$ZodArray;
  z.array(z.string()) satisfies z.ZodArray;
  z.array(z.string()) satisfies z.ZodType<Array<unknown>>;

  // $ZodObject
  z.object({ key: z.string() }) satisfies z.core.$ZodObject;
  z.object({ key: z.string() }) satisfies z.ZodObject<{ key: z.ZodType }>;
  z.object({ key: z.string() }) satisfies z.ZodType<{ key: string }>;

  // $ZodUnion
  z.union([z.string(), z.number()]) satisfies z.core.$ZodUnion;
  z.union([z.string(), z.number()]) satisfies z.ZodUnion;
  z.union([z.string(), z.number()]) satisfies z.ZodType<string | number>;

  // $ZodIntersection
  z.intersection(z.string(), z.number()) satisfies z.core.$ZodIntersection;
  z.intersection(z.string(), z.number()) satisfies z.ZodIntersection;

  // $ZodTuple
  z.tuple([z.string(), z.number()]) satisfies z.core.$ZodTuple;
  z.tuple([z.string(), z.number()]) satisfies z.ZodTuple;

  // $ZodRecord
  z.record(z.string(), z.number()) satisfies z.core.$ZodRecord;
  z.record(z.string(), z.number()) satisfies z.ZodRecord;

  // $ZodMap
  z.map(z.string(), z.number()) satisfies z.core.$ZodMap;
  z.map(z.string(), z.number()) satisfies z.ZodMap;

  // $ZodSet
  z.set(z.string()) satisfies z.core.$ZodSet;
  z.set(z.string()) satisfies z.ZodSet;

  // $ZodLiteral
  z.literal("example") satisfies z.core.$ZodLiteral;
  z.literal("example") satisfies z.ZodLiteral;

  // $ZodEnum
  z.enum(["a", "b", "c"]) satisfies z.core.$ZodEnum;
  z.enum(["a", "b", "c"]) satisfies z.ZodEnum;

  // $ZodPromise
  z.promise(z.string()) satisfies z.core.$ZodPromise;
  z.promise(z.string()) satisfies z.ZodPromise;

  // $ZodLazy
  const lazySchema = z.lazy(() => z.string());
  lazySchema satisfies z.core.$ZodLazy;
  lazySchema satisfies z.ZodLazy;

  // $ZodOptional
  z.string().optional() satisfies z.core.$ZodOptional;
  z.string().optional() satisfies z.ZodOptional;

  // $ZodDefault
  z.string().default("default") satisfies z.core.$ZodDefault;
  z.string().default("default") satisfies z.ZodDefault;

  // $ZodTemplateLiteral
  z.templateLiteral([z.literal("a"), z.literal("b")]) satisfies z.core.$ZodTemplateLiteral;
  z.templateLiteral([z.literal("a"), z.literal("b")]) satisfies z.ZodTemplateLiteral;

  // $ZodCustom
  z.custom<string>((val) => typeof val === "string") satisfies z.core.$ZodCustom;
  z.custom<string>((val) => typeof val === "string") satisfies z.ZodCustom;

  // $ZodTransform
  z.transform((val) => val as string) satisfies z.core.$ZodTransform;
  z.transform((val) => val as string) satisfies z.ZodTransform;

  // $ZodNonOptional
  z.string().optional().nonoptional() satisfies z.core.$ZodNonOptional;
  z.string().optional().nonoptional() satisfies z.ZodNonOptional;

  // $ZodReadonly
  z.object({ key: z.string() }).readonly() satisfies z.core.$ZodReadonly;
  z.object({ key: z.string() }).readonly() satisfies z.ZodReadonly;

  // $ZodNaN
  z.nan() satisfies z.core.$ZodNaN;
  z.nan() satisfies z.ZodNaN;

  // $ZodPipe
  z.unknown().pipe(z.number()) satisfies z.core.$ZodPipe;
  z.unknown().pipe(z.number()) satisfies z.ZodPipe;

  // $ZodPreprocess
  z.preprocess((v) => v, z.number()) satisfies z.core.$ZodPreprocess;
  z.preprocess((v) => v, z.number()) satisfies z.ZodPreprocess;
  z.preprocess((v) => v, z.number()) satisfies z.core.$ZodPipe<z.core.$ZodTransform, z.ZodNumber>;
  z.preprocess((v) => v, z.number()) satisfies z.ZodPipe<z.core.$ZodTransform, z.ZodNumber>;

  // $ZodSuccess
  z.success(z.string()) satisfies z.core.$ZodSuccess;
  z.success(z.string()) satisfies z.ZodSuccess;

  // $ZodCatch
  z.string().catch("fallback") satisfies z.core.$ZodCatch;
  z.string().catch("fallback") satisfies z.ZodCatch;

  // $ZodFile
  z.file() satisfies z.core.$ZodFile;
  z.file() satisfies z.ZodFile;
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
    webAddress: z.string().url().nullable(),
  });
  const Company = z.schemaForType<Company>()(CompanySchema);

  Company.shape.id.min(1);
  expectTypeOf<z.output<typeof Company>>().toEqualTypeOf<Company>();

  const CoreCompany = core.schemaForType<Company>()(CompanySchema);
  expectTypeOf<core.output<typeof CoreCompany>>().toEqualTypeOf<Company>();

  const UtilCompany = z.core.util.schemaForType<Company>()(CompanySchema);
  expectTypeOf<z.output<typeof UtilCompany>>().toEqualTypeOf<Company>();

  type Complex = {
    kind: "company";
    nested: {
      founded: Date;
      tags: string[];
    };
    scores: Record<"a" | "b", number>;
    tuple: [string, number];
    status: "active" | "inactive";
  };

  const Complex = z.schemaForType<Complex>()(
    z.object({
      kind: z.literal("company"),
      nested: z.object({
        founded: z.date(),
        tags: z.array(z.string()),
      }),
      scores: z.record(z.enum(["a", "b"]), z.number()),
      tuple: z.tuple([z.string(), z.number()]),
      status: z.union([z.literal("active"), z.literal("inactive")]),
    })
  );
  expectTypeOf<z.output<typeof Complex>>().toEqualTypeOf<Complex>();

  type Items = {
    items: { value: string }[];
  };

  const Items = z.schemaForType<Items>()(
    z.object({
      items: z.array(z.object({ value: z.string() })),
    })
  );
  expectTypeOf<z.output<typeof Items>>().toEqualTypeOf<Items>();

  type ReadonlyItem = Readonly<{
    id: string;
  }>;

  const ReadonlyItem = z.schemaForType<ReadonlyItem>()(z.object({ id: z.string() }).readonly());
  expectTypeOf<z.output<typeof ReadonlyItem>>().toEqualTypeOf<ReadonlyItem>();

  const Transformed = z.schemaForType<{ count: number }>()(
    z.object({
      count: z.string().transform((value) => value.length),
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
      webAddress: z.string().url().nullable(),
      extra: z.string(),
    })
  );

  z.schemaForType<Company>()(
    // @ts-expect-error wrong property output fails matching
    z.object({
      id: z.number(),
      name: z.string(),
      webAddress: z.string().url().nullable(),
    })
  );

  z.schemaForType<ReadonlyItem>()(
    // @ts-expect-error readonly output is required
    z.object({
      id: z.string(),
    })
  );

  // @ts-expect-error any is only an exact match for any
  z.schemaForType<string>()(z.any());

  // @ts-expect-error schemaForType checks output, not input
  z.schemaForType<string>()(z.string().transform((value) => value.length));
});

test("checks", () => {
  const _a: z.core.$ZodCheck = {} as any as z.core.$ZodChecks;
  const _b: z.core.$ZodCheck = {} as any as z.core.$ZodStringFormatChecks;
  const _c: z.core.$ZodType = {} as any as z.core.$ZodTypes;
  const _d: z.core.$ZodType = {} as any as z.core.$ZodStringFormatTypes;
});

test("assignability to $ZodType", () => {
  z.string() satisfies z.ZodType;
  z.number() satisfies z.ZodType;
  z.boolean() satisfies z.ZodType;
  z.object({ key: z.string() }) satisfies z.ZodType;
  z.object({ key: z.string() }) satisfies z.ZodType<{ key: string }>;
  z.array(z.string()) satisfies z.ZodType;
  z.union([z.string(), z.number()]) satisfies z.ZodType;
  z.intersection(z.string(), z.number()) satisfies z.ZodType;
  z.tuple([z.string(), z.number()]) satisfies z.ZodType;
  z.record(z.string(), z.number()) satisfies z.ZodType;
  z.map(z.string(), z.number()) satisfies z.ZodType;
  z.set(z.string()) satisfies z.ZodType;
  z.literal("example") satisfies z.ZodType;

  expectTypeOf<z.ZodType extends z.core.$ZodType ? true : false>().toEqualTypeOf<true>();
});

test("assignability with narrowing", () => {
  type _RefinedSchema<T extends z.ZodType<object> | z.ZodUnion> = T extends z.ZodUnion
    ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
    : T extends z.ZodType<object>
      ? RefinedTypeSchema<z.output<T>> // <-- Type instantiation is excessively deep and possibly infinite.
      : never;

  type RefinedTypeSchema<T extends object> = T;

  type RefinedUnionSchema<T extends z.ZodUnion> = T;
});

test("generic assignability in objects", () => {
  interface SortItem<T extends string> {
    key: T;
    order: string;
  }

  const createSortItemSchema = <T extends z.ZodType<string>>(sortKeySchema: T) =>
    z.object({
      key: sortKeySchema,
      order: z.string(),
    });

  <T extends z.ZodType<string>>(sortKeySchema: T, defaultSortBy: SortItem<z.output<T>>[] = []) =>
    createSortItemSchema(sortKeySchema).array().default(defaultSortBy);
});
