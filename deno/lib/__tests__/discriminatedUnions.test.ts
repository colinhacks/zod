// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
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

test("valid - various zod validator discriminators", () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.undefined(), val: z.literal(1) }),
    z.object({ type: z.null(), val: z.literal(2) }),
    z.object({ type: z.enum(["a", "b", "c"]), val: z.literal(3) }),
  ]);

  expect(schema.parse({ type: undefined, val: 1 })).toEqual({
    type: undefined,
    val: 1,
  });
  expect(schema.parse({ type: null, val: 2 })).toEqual({
    type: null,
    val: 2,
  });
  expect(schema.parse({ type: "c", val: 3 })).toEqual({
    type: "c",
    val: 3,
  });
});

test("valid - wrapped optional discriminator value ", () => {
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("1").optional(), val: z.literal(1) }),
    z.object({ type: z.literal(1), val: z.literal(2) }),
  ]);

  expect(schema.parse({ type: "1", val: 1 })).toEqual({ type: "1", val: 1 });
  expect(schema.parse({ type: undefined, val: 1 })).toEqual({
    type: undefined,
    val: 1,
  });
  expect(schema.parse({ type: 1, val: 2 })).toEqual({ type: 1, val: 2 });
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
        discriminator: "type",
        message: 'No match found for discriminator "type"',
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

test("valid - `DiscriminatedUnion` as a union option", () => {
  const A = z.object({ type: z.literal("a"), a: z.literal(1) });
  const B = z.object({ type: z.literal("b"), b: z.literal(2) });
  const C = z.object({ type: z.literal("c").optional(), c: z.literal(true) });
  const AorB = z.discriminatedUnion("type", [A, B]);
  const schema = z.discriminatedUnion("type", [AorB, C]);

  expect(schema.parse({ type: "a", a: 1 })).toEqual({ type: "a", a: 1 });
  expect(schema.parse({ type: "b", b: 2 })).toEqual({ type: "b", b: 2 });
  expect(schema.parse({ type: undefined, c: true })).toEqual({
    type: undefined,
    c: true,
  });

  expect(schema.parse({ type: "c", c: true })).toEqual({
    type: "c",
    c: true,
  });
});

test("valid expected types from inference with another DiscriminatedUnion element", () => {
  const A = z.object({ type: z.literal("a"), a: z.literal(1) });
  const B = z.object({ type: z.literal("b"), b: z.literal(2) });
  const C = z.object({ type: z.literal("c").optional(), c: z.literal(true) });
  const AorB = z.discriminatedUnion("type", [A, B]);
  const schema = z.discriminatedUnion("type", [AorB, C]);
  type schemaType = z.infer<typeof schema>;

  util.assertEqual<
    schemaType,
    | { type: "a"; a: 1 }
    | { type: "b"; b: 2 }
    | { type?: "c" | undefined; c: true }
  >(true);
});

test("valid - nested disjointed DiscriminatedUnions", () => {
  const subtype = z.discriminatedUnion("subtype", [
    z.object({
      type: z.literal("baz"),
      subtype: z.literal("able"),
    }),
    z.object({
      type: z.literal("bauble"),
      subtype: z.literal("beehive"),
      undertype: z.literal("alpha"),
    }),
    z.object({
      type: z.literal("baz"),
      subtype: z.literal("baker"),
    }),
  ]);

  const schema = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("foo"),
    }),
    z.object({
      type: z.literal("bar"),
    }),
    subtype,
  ]);

  const testMaps = [
    { type: "baz", subtype: "able" },
    { type: "baz", subtype: "baker" },
    { type: "bauble", subtype: "beehive", undertype: "alpha" },
    { type: "foo" },
    { type: "bar" },
  ];

  testMaps.map((el) => expect(schema.parse(el)).toEqual(el));
});

test("valid expected types from inference with disjointed nested DiscriminatedUnions", () => {
  const underDU = z.discriminatedUnion("undertype", [
    z.object({
      undertype: z.literal("a"),
      subtype: z.literal(1),
      wowee: z.literal(true),
    }),
    z.object({
      undertype: z.literal("b"),
      subtype: z.literal(1),
      wowee: z.literal(false),
    }),
    z.object({
      undertype: z.literal("c"),
      subtype: z.literal(2),
      extra: z.literal("yes"),
    }),
  ]);

  const subDU = z.discriminatedUnion("subtype", [
    underDU,
    z.object({
      subtype: z.literal(9),
      additional: z.literal("true"),
    }),
  ]);

  type schemaType = z.infer<typeof subDU>;

  util.assertEqual<
    schemaType,
    | { undertype: "a"; subtype: 1; wowee: true }
    | { undertype: "b"; subtype: 1; wowee: false }
    | { undertype: "c"; subtype: 2; extra: "yes" }
    | { subtype: 9; additional: "true" }
  >(true);
});

const subsubtype = z.discriminatedUnion("subsubtype", [
  z.object({
    type: z.literal("c"),
    subtype: z.literal("z"),
    subsubtype: z.literal("1"),
    a: z.string(),
  }),
  z.object({
    type: z.literal("c"),
    subtype: z.literal("z"),
    subsubtype: z.literal("2"),
    b: z.number(),
  }),
]);

const subtype = z.discriminatedUnion("subtype", [
  subsubtype,
  z.object({ type: z.literal("c"), subtype: z.literal("x"), a: z.string() }),
  z.object({ type: z.literal("c"), subtype: z.literal("y"), b: z.number() }),
]);

const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), b: z.number() }),
  z.object({ type: z.literal("b"), b: z.number() }),
  subtype,
]);

test("nesting", () => {
  schema.parse({ type: "c", subtype: "z", subsubtype: "1", a: "asdf" });
});

test("missing discriminator", () => {
  const subtype = z.discriminatedUnion("subtype", [
    z.object({
      ALKJFDLKSD: z.literal("c"),
      subtype: z.literal("x"),
      a: z.string(),
    }),
    z.object({ type: z.literal("c"), subtype: z.literal("y"), b: z.number() }),
  ]);

  expect(() => {
    // should throw in constructor
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), b: z.number() }),
      z.object({ type: z.literal("b"), b: z.number() }),
      subtype,
    ]);
  }).toThrow();
});

test("various key types", () => {
  // declare many different types of keys
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a"), b: z.number() }),
    z.object({ type: z.literal("b"), c: z.number() }),
    z.object({ type: z.literal("c"), d: z.number() }),
    z.object({ type: z.null(), e: z.number() }),
    z.object({ type: z.undefined(), f: z.number() }),
    z.object({ type: z.boolean(), g: z.number() }),
    z.object({ type: z.number(), h: z.number() }),
    z.object({ type: z.array(z.string()), k: z.number() }),
    z.object({ type: z.record(z.string()), l: z.number() }),
    z.object({ type: z.tuple([z.string(), z.number()]), m: z.number() }),
    z.object({ type: z.enum(["asdf"]), n: z.number() }),
  ]);

  const value = schema.parse({ type: "a", b: 1 });
  if (value.type === "a") {
    value.b;
  } else if (value.type === "b") {
    value.c;
  } else if (value.type === "c") {
    value.d;
  } else if (value.type === null) {
    value.e;
  } else if (value.type === undefined) {
    value.f;
  } else if (value.type === true) {
    value.g;
  } else if (value.type === false) {
    value.g;
  } else if (value.type === "asdf") {
    value.n;
  }

  schema.parse({ type: "a", b: 1 });
  schema.parse({ type: "b", c: 1 });
  schema.parse({ type: "c", d: 1 });
  schema.parse({ type: null, e: 1 });
  schema.parse({ type: undefined, f: 1 });
  schema.parse({ type: true, g: 1 });
  schema.parse({ type: false, g: 1 });
  schema.parse({ type: 1, h: 1 });
  schema.parse({ type: ["asdf"], k: 1 });
  schema.parse({ type: { asdf: "asdf" }, l: 1 });
  schema.parse({ type: ["asdf", 1], m: 1 });
  schema.parse({ type: "asdf", n: 1 });
});
