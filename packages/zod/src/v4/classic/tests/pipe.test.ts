import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test("string to number pipe", () => {
  const schema = z.string().transform(Number).pipe(z.number());
  expect(schema.parse("1234")).toEqual(1234);
});

test("string to number pipe async", async () => {
  const schema = z
    .string()
    .transform(async (val) => Number(val))
    .pipe(z.number());
  expect(await schema.parseAsync("1234")).toEqual(1234);
});

test("pipe contextually types transforms", () => {
  const schema = z.string().pipe(z.transform((val) => val.toUpperCase()));
  expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<string>();

  // @ts-expect-error incompatible pipe targets are still rejected
  z.string().pipe(z.number());
});

test("pipe branded output to unbranded input", () => {
  const zodBrand = z.string().brand<"myBrand">();
  const inputSchema = z.object({
    a: z.number(),
    c: zodBrand,
  });
  const validateSchema = z.object({
    a: z.number(),
    c: zodBrand,
  });

  const testSchemaPipeline = inputSchema.transform((input) => input).pipe(validateSchema);
  const testSchemaPipeline2 = inputSchema.pipe(validateSchema);
  const testSchemaPipeline3 = inputSchema.pipe(inputSchema);

  expectTypeOf<z.output<typeof testSchemaPipeline>>().toEqualTypeOf<{
    a: number;
    c: string & z.core.$brand<"myBrand">;
  }>();
  expectTypeOf<z.output<typeof testSchemaPipeline2>>().toEqualTypeOf<z.output<typeof validateSchema>>();
  expectTypeOf<z.output<typeof testSchemaPipeline3>>().toEqualTypeOf<z.output<typeof inputSchema>>();
});

test("string with default fallback", () => {
  const stringWithDefault = z
    .pipe(
      z.transform((v) => (v === "none" ? undefined : v)),
      z.string()
    )
    .catch("default");

  expect(stringWithDefault.parse("ok")).toBe("ok");
  expect(stringWithDefault.parse(undefined)).toBe("default");
  expect(stringWithDefault.parse("none")).toBe("default");
  expect(stringWithDefault.parse(15)).toBe("default");
});

test("continue on non-fatal errors", () => {
  const schema = z
    .string()
    .refine((c) => c === "1234", "A")
    .transform((val) => Number(val))
    .refine((c) => c === 1234, "B");

  schema.parse("1234");

  expect(schema.safeParse("4321")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "A"
      }
    ]],
      "success": false,
    }
  `);
});

test("break on fatal errors", () => {
  const schema = z
    .string()
    .refine((c) => c === "1234", { message: "A", abort: true })
    .transform((val) => Number(val))
    .refine((c) => c === 1234, "B");

  schema.parse("1234");

  expect(schema.safeParse("4321")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "A"
      }
    ]],
      "success": false,
    }
  `);
});

test("reverse parsing with pipe", () => {
  const schema = z.string().pipe(z.string());

  // Reverse direction: default should NOT be applied
  expect(z.safeDecode(schema, "asdf")).toMatchInlineSnapshot(`
    {
      "data": "asdf",
      "success": true,
    }
  `);
  expect(z.safeEncode(schema, "asdf")).toMatchInlineSnapshot(`
    {
      "data": "asdf",
      "success": true,
    }
  `);
});

test("reverse parsing with pipe", () => {
  const schema = z.string().transform((val) => val.length);

  // should throw
  expect(() => z.encode(schema, 1234)).toThrow();
});
