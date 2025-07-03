// @ts-ignore TS6133
import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test(".optional()", () => {
  const schema = z.string().optional();
  expect(schema.parse("adsf")).toEqual("adsf");
  expect(schema.parse(undefined)).toEqual(undefined);
  expect(schema.safeParse(null).success).toEqual(false);

  expectTypeOf<typeof schema._output>().toEqualTypeOf<string | undefined>();
});

test("unwrap", () => {
  const unwrapped = z.string().optional().unwrap();
  expect(unwrapped).toBeInstanceOf(z.ZodString);
});

test("optionality", () => {
  const a = z.string();
  expect(a._zod.optin).toEqual(undefined);
  expect(a._zod.optout).toEqual(undefined);

  const b = z.string().optional();
  expect(b._zod.optin).toEqual("optional");
  expect(b._zod.optout).toEqual("optional");

  const c = z.string().default("asdf");
  expect(c._zod.optin).toEqual("optional");
  expect(c._zod.optout).toEqual(undefined);

  const d = z.string().optional().nullable();
  expect(d._zod.optin).toEqual("optional");
  expect(d._zod.optout).toEqual("optional");

  const e = z.string().default("asdf").nullable();
  expect(e._zod.optin).toEqual("optional");
  expect(e._zod.optout).toEqual(undefined);
});

test("pipe optionality", () => {
  z.string().optional()._zod.optin;
  const a = z.string().optional().pipe(z.string());
  expect(a._zod.optin).toEqual("optional");
  expect(a._zod.optout).toEqual(undefined);
  expectTypeOf<typeof a._zod.optin>().toEqualTypeOf<"optional">();
  expectTypeOf<typeof a._zod.optout>().toEqualTypeOf<"optional" | undefined>();

  const b = z
    .string()
    .transform((val) => (Math.random() ? val : undefined))
    .pipe(z.string().optional());
  expect(b._zod.optin).toEqual(undefined);
  expect(b._zod.optout).toEqual("optional");
  expectTypeOf<typeof b._zod.optin>().toEqualTypeOf<"optional" | undefined>();
  expectTypeOf<typeof b._zod.optout>().toEqualTypeOf<"optional">();

  const c = z.string().default("asdf").pipe(z.string());
  expect(c._zod.optin).toEqual("optional");
  expect(c._zod.optout).toEqual(undefined);

  const d = z
    .string()
    .transform((val) => (Math.random() ? val : undefined))
    .pipe(z.string().default("asdf"));
  expect(d._zod.optin).toEqual(undefined);
  expect(d._zod.optout).toEqual(undefined);
});

test("pipe optionality inside objects", () => {
  const schema = z.object({
    a: z.string().optional(),
    b: z.string().optional().pipe(z.string()),
    c: z.string().default("asdf").pipe(z.string()),
    d: z
      .string()
      .transform((val) => (Math.random() ? val : undefined))
      .pipe(z.string().optional()),
    e: z
      .string()
      .transform((val) => (Math.random() ? val : undefined))
      .pipe(z.string().default("asdf")),
  });

  type SchemaIn = z.input<typeof schema>;
  expectTypeOf<SchemaIn>().toEqualTypeOf<{
    a?: string | undefined;
    b?: string | undefined;
    c?: string | undefined;
    d: string;
    e: string;
  }>();

  type SchemaOut = z.output<typeof schema>;
  expectTypeOf<SchemaOut>().toEqualTypeOf<{
    a?: string | undefined;
    b: string;
    c: string;
    d?: string | undefined;
    e: string;
  }>();
});
