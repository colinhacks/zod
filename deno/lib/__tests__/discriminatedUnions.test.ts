import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
import { ZodDiscriminatedUnion } from "../index.ts";

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

test("invalid - collision with multiple undefined discriminators", () => {
  try {
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("1").optional(), val: z.literal(1) }),
      z.object({ type: z.literal(undefined), val: z.literal(2) }),
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("has duplicate value")).toEqual(true);
  }
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

test("invalid - duplicate values for nested disjointed DUs", () => {
  const underDU = z.discriminatedUnion("undertype", [
    z.object({
      undertype: z.literal("a"),
      subtype: z.literal(9),
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
  try {
    z.discriminatedUnion("subtype", [
      underDU,
      z.object({
        subtype: z.literal(9),
        additional: z.literal("true"),
      }),
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("has duplicate value `9`")).toEqual(true);
  }
});

test("invalid - nested DUs with missing parent discriminator keys", () => {
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
      additional: z.literal("true"),
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
      additional: z.literal("false"),
    }),
  ]);

  try {
    z.discriminatedUnion("additional", [
      subDU,
      z.object({
        subtype: z.literal(9),
        additional: z.literal("true"),
      }),
    ]);
    throw new Error();
  } catch (e: any) {
    expect(
      e.message.includes("value for key `additional` could not be extracted")
    ).toEqual(true);
  }
});

test("multiple nested DiscriminatedUnion elements", () => {
  const NESTING_DEPTH = 20;
  const elementArray = Array(NESTING_DEPTH)
    .fill(0)
    .map((_el, i) =>
      z.object({ type: z.literal(i), [`${i}`]: z.literal(true) })
    );

  const firstSchema = z.discriminatedUnion("type", [
    elementArray[0],
    elementArray[1],
  ]);

  const schema = elementArray
    .slice(2)
    .reduce<ZodDiscriminatedUnion<"type", any>>(
      (prev, curr) => z.discriminatedUnion("type", [prev, curr]),
      firstSchema
    );

  Array(NESTING_DEPTH)
    .fill(0)
    .map((_el, i) => ({ type: i, [`${i}`]: true }))
    .map((el) => {
      expect(schema.parse(el)).toEqual(el);
    });
});

test("discriminator not available for nested DiscriminatedUnion", () => {
  try {
    const A = z.object({ type: z.literal("a"), a: z.literal(1) });
    const B = z.object({ type: z.literal("b"), b: z.literal(2) });
    const AorB = z.discriminatedUnion("type", [A, B]);

    const C = z.object({ foo: z.literal("c"), a: z.literal(3) });
    const D = z.object({ foo: z.literal("d"), b: z.literal(4) });
    const CorD = z.discriminatedUnion("foo", [C, D]);

    z.discriminatedUnion("type", [AorB, CorD as any]);
    throw new Error();
  } catch (e: any) {
    expect(
      e.message.includes("value for key `type` could not be extracted")
    ).toEqual(true);
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

test("nested DUs with disjointed base discriminators", () => {});
