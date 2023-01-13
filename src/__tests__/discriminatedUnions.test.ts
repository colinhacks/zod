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

test("valid - union of union", () => {
  const A = z.object({
    discriminator1: z.literal(true),
    msg: z.string(),
  });
  
  const BA = z.object({
    param1: z.number(),
    discriminator2: z.literal(false),
    discriminator1: z.literal(false),
  });
  
  const BB = z.object({
    param2: z.number(),
    discriminator2: z.literal(true),
    discriminator1: z.literal(false),
  });
  
  const B = z.discriminatedUnion("discriminator2", [BA, BB]);
  const schema = z.discriminatedUnion("discriminator1", [A, B]);

  expect(schema.parse({ discriminator1: false, discriminator2: true, param2: 1 })).toEqual({
    discriminator1: false,
    discriminator2: true,
    param2: 1,
  });

  expect(schema.parse({ discriminator1: false, discriminator2: false, param1: 1 })).toEqual({
    discriminator1: false,
    discriminator2: false,
    param1: 1,
  });

  expect(schema.parse({ discriminator1: true, msg: "Foo" })).toEqual({
    discriminator1: true,
    msg: "Foo",
  });
})

test("invalid - union of union", () => {
  const A = z.object({
    discriminator1: z.literal(true),
    msg: z.string(),
  });
  
  const BA = z.object({
    param1: z.number(),
    discriminator2: z.literal(false),
    discriminator1: z.literal(false),
  });
  
  const BB = z.object({
    param2: z.number(),
    discriminator2: z.literal(true),
    discriminator1: z.literal(false),
  });
  
  const B = z.discriminatedUnion("discriminator2", [BA, BB]);
  const schema = z.discriminatedUnion("discriminator1", [A, B]);

  try {
    schema.parse({ discriminator1: false, discriminator2: true })
  } catch(e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "number",
        received: "undefined",
        path: [ "param2" ],
        message: "Required"
      },
    ]);
  }

  try {
    schema.parse({ discriminator1: false, discriminator2: false })
  } catch(e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "number",
        received: "undefined",
        path: [ "param1" ],
        message: "Required"
      },
    ]);
  }

  try {
    schema.parse({ discriminator1: true })
  } catch(e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: [ "msg" ],
        message: "Required"
      },
    ]);
  }
})