// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

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

test("enum and nativeEnum", () => {
  enum MyEnum {
    d,
    e = "e",
  }

  const schema = z.discriminatedUnion("key", [
    z.object({
      key: z.literal("a"),
      // Add other properties specific to this option
    }),
    z.object({
      key: z.enum(["b", "c"]),
      // Add other properties specific to this option
    }),
    z.object({
      key: z.nativeEnum(MyEnum),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;

  schema.parse({ key: "a" });
  schema.parse({ key: "b" });
  schema.parse({ key: "c" });
  schema.parse({ key: MyEnum.d });
  schema.parse({ key: MyEnum.e });
  schema.parse({ key: "e" });
});

test("branded", () => {
  const schema = z.discriminatedUnion("key", [
    z.object({
      key: z.literal("a"),
      // Add other properties specific to this option
    }),
    z.object({
      key: z.literal("b").brand("asdfaf"),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;

  schema.parse({ key: "a" });
  schema.parse({ key: "b" });
  expect(() => {
    schema.parse({ key: "c" });
  }).toThrow();
});

test("optional and nullable", () => {
  const schema = z.discriminatedUnion("key", [
    z.object({
      key: z.literal("a").optional(),
      a: z.literal(true),
    }),
    z.object({
      key: z.literal("b").nullable(),
      b: z.literal(true),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;
  z.util.assertEqual<
    schema,
    { key?: "a" | undefined; a: true } | { key: "b" | null; b: true }
  >(true);

  schema.parse({ key: "a", a: true });
  schema.parse({ key: undefined, a: true });
  schema.parse({ key: "b", b: true });
  schema.parse({ key: null, b: true });
  expect(() => {
    schema.parse({ key: null, a: true });
  }).toThrow();
  expect(() => {
    schema.parse({ key: "b", a: true });
  }).toThrow();

  const value = schema.parse({ key: null, b: true });

  if (!("key" in value)) value.a;
  if (value.key === undefined) value.a;
  if (value.key === "a") value.a;
  if (value.key === "b") value.b;
  if (value.key === null) value.b;
});

test("readonly array of options", () => {
  const options = [
    z.object({ type: z.literal("x"), val: z.literal(1) }),
    z.object({ type: z.literal("y"), val: z.literal(2) }),
  ] as const;

  expect(
    z.discriminatedUnion("type", options).parse({ type: "x", val: 1 })
  ).toEqual({ type: "x", val: 1 });
});

test("valid - unions and intersections of objects", () => {
  const union = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), a: z.string() }),
    z.object({ type: z.literal("b") }).and(z.object({ b: z.string() })),
    z
      .object({ type: z.literal("c"), c: z.string() })
      .or(z.object({ type: z.literal("c"), c: z.number() }))
      .or(z.object({ type: z.literal("d"), d: z.string() })),
    z
      .object({ type: z.literal("e"), e: z.string() })
      .and(z.object({ foo: z.string() }).or(z.object({ bar: z.string() }))),
    z
      .object({ type: z.literal("f"), f: z.string() })
      .or(z.object({ type: z.literal("f") }).and(z.object({ f: z.number() }))),
    z.discriminatedUnion("foo", [
      z.object({ type: z.literal("g"), foo: z.literal("bar") }),
      z.object({ type: z.literal("h"), foo: z.literal("baz") }),
    ]),
    z
      .object({ type: z.literal("i").or(z.literal("j")) })
      .and(
        z.object({
          type: z.literal("i").or(z.literal("j")).and(z.literal("i")),
        })
      )
      .and(z.object({ type: z.literal("i") }))
      .and(z.object({ foo: z.string() })),
  ]);

  expect(union.parse({ type: "a", a: "123" })).toEqual({ type: "a", a: "123" });
  expect(union.parse({ type: "b", b: "123" })).toEqual({ type: "b", b: "123" });
  expect(union.parse({ type: "c", c: "123" })).toEqual({ type: "c", c: "123" });
  expect(union.parse({ type: "c", c: 123 })).toEqual({ type: "c", c: 123 });
  expect(union.parse({ type: "d", d: "123" })).toEqual({ type: "d", d: "123" });
  expect(() => {
    union.parse({ type: "d", c: "123" });
  }).toThrow();
  expect(union.parse({ type: "e", e: "123", foo: "456" })).toEqual({
    type: "e",
    e: "123",
    foo: "456",
  });
  expect(union.parse({ type: "e", e: "123", bar: "456" })).toEqual({
    type: "e",
    e: "123",
    bar: "456",
  });
  expect(() => {
    union.parse({ type: "e", e: "123" });
  }).toThrow();
  expect(union.parse({ type: "f", f: "123" })).toEqual({ type: "f", f: "123" });
  expect(union.parse({ type: "f", f: 123 })).toEqual({ type: "f", f: 123 });
  expect(union.parse({ type: "g", foo: "bar" })).toEqual({
    type: "g",
    foo: "bar",
  });
  expect(union.parse({ type: "h", foo: "baz" })).toEqual({
    type: "h",
    foo: "baz",
  });
  expect(() => {
    union.parse({ type: "h", foo: "bar" });
  }).toThrow();
  expect(union.parse({ type: "i", foo: "123" })).toEqual({
    type: "i",
    foo: "123",
  });
  expect(() => {
    union.parse({ type: "j", foo: "123" });
  }).toThrow();
});
