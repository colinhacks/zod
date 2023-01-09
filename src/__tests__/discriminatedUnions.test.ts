import { expect, test } from "@jest/globals";

import * as z from "../index";

test("valid", () => {
  expect(
    z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ])
      .parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });
});

test("valid - discriminator value of various primitive types", () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("1"), val: z.literal(1) }),
    z.object({ type: z.literal(1), val: z.literal(2) }),
    z.object({ type: z.literal(BigInt(1)), val: z.literal(3) }),
    z.object({ type: z.literal("true"), val: z.literal(4) }),
    z.object({ type: z.literal(true), val: z.literal(5) }),
    z.object({ type: z.literal("null"), val: z.literal(6) }),
    z.object({ type: z.literal(null), val: z.literal(7) }),
    z.object({ type: z.literal("undefined"), val: z.literal(8) }),
    z.object({ type: z.literal(undefined), val: z.literal(9) }),
    z.object({ type: z.literal("transform"), val: z.literal(10) }),
    z.object({ type: z.literal("refine"), val: z.literal(11) }),
    z.object({ type: z.literal("superRefine"), val: z.literal(12) }),
  ]);

  expect(schema.parse({ type: "1", val: 1 })).toEqual({ type: "1", val: 1 });
  expect(schema.parse({ type: 1, val: 2 })).toEqual({ type: 1, val: 2 });
  expect(schema.parse({ type: BigInt(1), val: 3 })).toEqual({
    type: BigInt(1),
    val: 3,
  });
  expect(schema.parse({ type: "true", val: 4 })).toEqual({
    type: "true",
    val: 4,
  });
  expect(schema.parse({ type: true, val: 5 })).toEqual({
    type: true,
    val: 5,
  });
  expect(schema.parse({ type: "null", val: 6 })).toEqual({
    type: "null",
    val: 6,
  });
  expect(schema.parse({ type: null, val: 7 })).toEqual({
    type: null,
    val: 7,
  });
  expect(schema.parse({ type: "undefined", val: 8 })).toEqual({
    type: "undefined",
    val: 8,
  });
  expect(schema.parse({ type: undefined, val: 9 })).toEqual({
    type: undefined,
    val: 9,
  });
});

test("invalid - null", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ]).parse(null);
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_type,
        expected: z.ZodParsedType.object,
        message: "Expected object, received null",
        received: z.ZodParsedType.null,
        path: [],
      },
    ]);
  }
});

test("invalid discriminator value", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ]).parse({ type: "x", a: "abc" });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_union_discriminator,
        options: ["a", "b"],
        message: "Invalid discriminator value. Expected 'a' | 'b'",
        path: ["type"],
      },
    ]);
  }
});

test("valid discriminator value, invalid data", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ]).parse({ type: "a", b: "abc" });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_type,
        expected: z.ZodParsedType.string,
        message: "Required",
        path: ["a"],
        received: z.ZodParsedType.undefined,
      },
    ]);
  }
});

test("wrong schema - missing discriminator", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ b: z.string() }) as any,
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("could not be extracted")).toBe(true);
  }
});

test("wrong schema - duplicate discriminator values", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("a"), b: z.string() }),
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("has duplicate value")).toEqual(true);
  }
});

test("async - valid", async () => {
  expect(
    await z
      .discriminatedUnion("type", [
        z.object({
          type: z.literal("a"),
          a: z
            .string()
            .refine(async () => true)
            .transform(async (val) => Number(val)),
        }),
        z.object({
          type: z.literal("b"),
          b: z.string(),
        }),
      ])
      .parseAsync({ type: "a", a: "1" })
  ).toEqual({ type: "a", a: 1 });
});

test("async - invalid", async () => {
  try {
    await z
      .discriminatedUnion("type", [
        z.object({
          type: z.literal("a"),
          a: z
            .string()
            .refine(async () => true)
            .transform(async (val) => val),
        }),
        z.object({
          type: z.literal("b"),
          b: z.string(),
        }),
      ])
      .parseAsync({ type: "a", a: 1 });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["a"],
        message: "Expected string, received number",
      },
    ]);
  }
});

test("valid - literals with .default or .preprocess", () => {
  const schema = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("foo").default("foo"),
      a: z.string(),
    }),
    z.object({
      type: z.literal("custom"),
      method: z.string(),
    }),
    z.object({
      type: z.preprocess((val) => String(val), z.literal("bar")),
      c: z.string(),
    }),
  ]);
  expect(schema.parse({ type: "foo", a: "foo" })).toEqual({
    type: "foo",
    a: "foo",
  });
});

test('strict', () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), foo: z.string() }).passthrough(),
    z.object({ type: z.literal("b"), baz: z.string() }).passthrough(),
  ]);

  const input = { type: "a", foo: "bar", test: 123 };

  const strictSchema = schema.strict();
  const output = strictSchema.safeParse(input);

  expect(output).toEqual({
    success: false,
    error: expect.objectContaining({ issues: [expect.objectContaining({ code: 'unrecognized_keys' })] })
  });

  expect(strictSchema.options).toHaveLength(2);
  strictSchema.options.forEach(option => {
    expect(option._def.unknownKeys).toEqual('strict');
  })
});

test('strip', () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), foo: z.string() }).strict(),
    z.object({ type: z.literal("b"), baz: z.string() }).strict(),
  ]);

  const input = { type: "a", foo: "bar", test: 123 };

  const stripSchema = schema.strip();
  const output = stripSchema.parse(input);

  expect(output).toEqual({ type: "a", foo: "bar" });

  expect(stripSchema.options).toHaveLength(2);
  stripSchema.options.forEach(option => {
    expect(option._def.unknownKeys).toEqual('strip');
  })
});

test('passthrough', () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), foo: z.string() }).strict(),
    z.object({ type: z.literal("b"), baz: z.string() }).strict(),
  ]);

  const input = { type: "a", foo: "bar", test: 123 };

  const passthroughSchema = schema.passthrough();
  const output = passthroughSchema.parse(input);

  expect(output).toEqual({ type: "a", foo: "bar", test: 123 });

  expect(passthroughSchema.options).toHaveLength(2);
  passthroughSchema.options.forEach(option => {
    expect(option._def.unknownKeys).toEqual('passthrough');
  })
});

test('catchall', () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), foo: z.string() }).strict(),
    z.object({ type: z.literal("b"), baz: z.string() }).strict(),
  ]);

  const catchallSchema = schema.catchall(z.number());

  const validInput = { type: "a", foo: "bar", test: 123 };
  const invalidInput = { type: "a", foo: "bar", test: 'this is a string' };

  expect(catchallSchema.parse(validInput)).toEqual({ type: "a", foo: "bar", test: 123 });
  expect(catchallSchema.safeParse(invalidInput)).toEqual({
    success: false,
    error: expect.objectContaining({
      issues: [expect.objectContaining({
        code: 'invalid_type', expected: 'number', received: 'string', path: ['test']
      })]
    })
  });
});

test("pick including discriminator", () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal("a"), foo: z.string() }).strip(),
    z.object({ type: z.literal("b"), baz: z.string() }).strip(),
  ])

  const pickSchema = schema.pick({ type: true, foo: true });

  expect(pickSchema.parse({ type: "a", foo: "bar" })).toEqual({ type: "a", foo: "bar" });
  expect(pickSchema.parse({ type: "b", baz: "bar" })).toEqual({ type: "b" });
});

test("pick without discriminator adds discriminator", () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal("a"), foo: z.string() }).strip(),
    z.object({ type: z.literal("b"), baz: z.string() }).strip(),
  ])

  const pickSchema = schema.pick({ foo: true });

  expect(pickSchema.parse({ type: "a", foo: "bar" })).toEqual({ type: "a", foo: "bar" });
  expect(pickSchema.parse({ type: "b", baz: "bar" })).toEqual({ type: "b" });
});

test("omit without discriminator", () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal("a"), foo: z.string() }).strip(),
    z.object({ type: z.literal("b"), baz: z.string() }).strip(),
  ])

  const pickSchema = schema.omit({ foo: true });

  expect(pickSchema.parse({ type: "a", foo: "bar" })).toEqual({ type: "a" });
  expect(pickSchema.parse({ type: "b", baz: "bar" })).toEqual({ type: "b", baz: "bar" });
});

test("try to omit discriminator", () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal("a"), foo: z.string() }).strip(),
    z.object({ type: z.literal("b"), baz: z.string() }).strip(),
  ])

  const pickSchema = schema.omit({ type: true } as any);

  expect(pickSchema.parse({ type: "a", foo: "bar" })).toEqual({ type: "a", foo: "bar" });
  expect(pickSchema.parse({ type: "b", baz: "bar" })).toEqual({ type: "b", baz: "bar" });
});

test('deepPartial, keeps discriminator required', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal("a"), foo: z.string() }).strip(),
    z.object({ type: z.literal("b"), baz: z.string() }).strip(),
  ]);

  const deepPartialSchema = schema.deepPartial();

  expect(deepPartialSchema.parse({ type: "a" })).toEqual({ type: "a" });
  expect(deepPartialSchema.parse({ type: "b", baz: "bar" })).toEqual({ type: "b", baz: "bar" });
  expect(deepPartialSchema.safeParse({})).toEqual({
    success: false,
    error: expect.objectContaining({
      issues: [expect.objectContaining({ code: 'invalid_union_discriminator', options: ["a", "b"] })]
    }),
  });
});