import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test.each([false, true])("undefined prefault preserves object keys (jitless: %s)", async (jitless) => {
  const previous = z.config().jitless;
  z.config({ jitless });
  try {
    let calls = 0;
    const field = z.union([z.string(), z.undefined()]).prefault(() => {
      calls++;
      return undefined;
    });
    const schema = z.object({ a: field });
    expectTypeOf<z.output<typeof field>>().toEqualTypeOf<string | undefined>();
    expectTypeOf<z.input<typeof schema>>().toEqualTypeOf<{ a?: string | undefined }>();
    expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<{ a: string | undefined }>();
    expect(schema.parse({})).toStrictEqual({ a: undefined });
    expect(calls).toBe(1);
    expect(schema.parse({ a: undefined })).toStrictEqual({ a: undefined });
    expect(calls).toBe(2);
    expect(await schema.parseAsync({})).toStrictEqual({ a: undefined });
    expect(calls).toBe(3);
    expect(schema.parse({ a: "value" })).toStrictEqual({ a: "value" });
    expect(schema.safeParse({ a: 123 }).success).toBe(false);
    expect(calls).toBe(3);

    const literal = z.prefault(z.string().optional(), undefined);
    expect(z.core.compileFn(z.object({ a: literal }))({})).toStrictEqual({ a: undefined });
    for (const wrapped of [literal, literal.readonly(), literal.nullable(), z.lazy(() => literal)]) {
      expect(z.object({ a: wrapped }).parse({})).toStrictEqual({ a: undefined });
    }
    expect(z.object({ a: literal.optional() }).parse({})).toStrictEqual({});
    expect(z.object({ a: literal.optional() }).parse({ a: undefined })).toStrictEqual({ a: undefined });
    expect(z.tuple([literal]).parse([])).toStrictEqual([undefined]);
  } finally {
    z.config({ jitless: previous });
  }
});

test("prefault preserves transformed undefined output", async () => {
  const field = z
    .string()
    .transform(() => undefined)
    .prefault("fallback");
  expectTypeOf<z.output<typeof field>>().toEqualTypeOf<undefined>();
  expect(field.parse(undefined)).toBeUndefined();
  const schema = z.object({ a: field, optional: z.string().optional() });
  expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<{ a: undefined; optional?: string | undefined }>();
  expect(schema.parse({})).toStrictEqual({ a: undefined });
  expect(z.core.compileFn(schema)({})).toStrictEqual({ a: undefined });
  expect(z.compile(schema).parse({})).toStrictEqual({ a: undefined });
  expect(
    await z
      .object({
        a: z
          .string()
          .transform(async () => undefined)
          .prefault("fallback"),
      })
      .parseAsync({})
  ).toStrictEqual({ a: undefined });
  expect(
    z
      .object({
        a: z
          .string()
          .prefault("fallback")
          .transform(() => undefined),
      })
      .parse({})
  ).toStrictEqual({ a: undefined });
});

test("basic prefault", () => {
  const a = z.prefault(z.string().trim(), "  default  ");
  expect(a).toBeInstanceOf(z.ZodPrefault);
  expect(a.parse("  asdf  ")).toEqual("asdf");
  expect(a.parse(undefined)).toEqual("default");

  type inp = z.input<typeof a>;
  expectTypeOf<inp>().toEqualTypeOf<string | undefined>();
  type out = z.output<typeof a>;
  expectTypeOf<out>().toEqualTypeOf<string>();
});

test("prefault inside object", () => {
  // test optinality
  const a = z.object({
    name: z.string().optional(),
    age: z.number().default(1234),
    email: z.string().prefault("1234"),
  });

  type inp = z.input<typeof a>;
  expectTypeOf<inp>().toEqualTypeOf<{
    name?: string | undefined;
    age?: number | undefined;
    email?: string | undefined;
  }>();

  type out = z.output<typeof a>;
  expectTypeOf<out>().toEqualTypeOf<{
    name?: string | undefined;
    age: number;
    email: string;
  }>();
});

test("object schema with prefault should return shallow clone", () => {
  const schema = z
    .object({
      a: z.string(),
    })
    .prefault({ a: "x" });
  const result1 = schema.parse(undefined);
  const result2 = schema.parse(undefined);
  expect(result1).not.toBe(result2);
  expect(result1).toEqual(result2);
});

test("direction-aware prefault", () => {
  const schema = z.string().prefault("hello");

  // Forward direction (regular parse): prefault should be applied
  expect(schema.parse(undefined)).toBe("hello");

  // Reverse direction (encode): prefault should NOT be applied, undefined should fail validation
  expect(z.safeEncode(schema, undefined as any)).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [],
        "message": "Invalid input: expected string, received undefined"
      }
    ]],
      "success": false,
    }
  `);

  // But valid values should still work in reverse
  expect(z.encode(schema, "world")).toBe("world");
});
