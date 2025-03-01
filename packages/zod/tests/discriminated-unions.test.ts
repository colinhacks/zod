import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod";

test("_values", () => {
  expect(z.string()._values).toEqual(undefined);
  expect(z.enum(["a", "b"])._values).toEqual(new Set(["a", "b"]));
  expect(z.nativeEnum({ a: "A", b: "B" })._values).toEqual(new Set(["A", "B"]));
  expect(z.literal("test")._values).toEqual(new Set(["test"]));
  expect(z.literal(123)._values).toEqual(new Set([123]));
  expect(z.literal(true)._values).toEqual(new Set([true]));
  expect(z.literal(BigInt(123))._values).toEqual(new Set([BigInt(123)]));
  expect(z.undefined()._values).toEqual(new Set([undefined]));
  expect(z.null()._values).toEqual(new Set([null]));

  const t = z.literal("test");
  expect(t.optional()._values).toEqual(new Set(["test", undefined]));
  expect(t.nullable()._values).toEqual(new Set(["test", null]));
  expect(t.default("test")._values).toEqual(new Set(["test"]));
  expect(t.catch("test")._values).toEqual(new Set(["test"]));

  const pre = z.preprocess((val) => String(val), z.string()).pipe(z.literal("test"));
  expect(pre._values).toEqual(undefined);

  const post = z.literal("test").transform((val) => Math.random());
  expect(post._values).toEqual(new Set(["test"]));
});

test("valid parse - object", () => {
  expect(
    z
      .discriminatedUnion([
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ])
      .parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });
});

test("valid parse - interface", () => {
  expect(
    z
      .discriminatedUnion([
        z.interface({ type: z.literal("a"), a: z.string() }),
        z.interface({ type: z.literal("b"), b: z.string() }),
      ])
      .parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });
});

test("valid - include discriminator key (deprecated)", () => {
  expect(
    z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ])
      .parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });
});

test("valid - optional discriminator (object)", () => {
  const schema = z.discriminatedUnion([
    z.object({ type: z.literal("a").optional(), a: z.string() }),
    z.object({ type: z.literal("b"), b: z.string() }),
  ]);
  expect(schema.parse({ type: "a", a: "abc" })).toEqual({ type: "a", a: "abc" });
  expect(schema.parse({ a: "abc" })).toEqual({ a: "abc" });
});

test("valid - optional discriminator (interface)", () => {
  const schema = z.discriminatedUnion([
    z.interface({ type: z.literal("a").optional(), a: z.string() }),
    z.interface({ type: z.literal("b"), b: z.string() }),
  ]);
  expect(schema.parse({ type: "a", a: "abc" })).toEqual({ type: "a", a: "abc" });
  expect(schema.parse({ type: undefined, a: "abc" })).toEqual({ type: undefined, a: "abc" });
  expect(schema.parse({ type: "b", b: "abc" })).toEqual({ type: "b", b: "abc" });
});

test("valid - discriminator value of various primitive types", () => {
  const schema = z.discriminatedUnion([
    z.object({ type: z.literal("1"), val: z.string() }),
    z.object({ type: z.literal(1), val: z.string() }),
    z.object({ type: z.literal(BigInt(1)), val: z.string() }),
    z.object({ type: z.literal("true"), val: z.string() }),
    z.object({ type: z.literal(true), val: z.string() }),
    z.object({ type: z.literal("null"), val: z.string() }),
    z.object({ type: z.null(), val: z.string() }),
    z.object({ type: z.literal("undefined"), val: z.string() }),
    z.object({ type: z.undefined(), val: z.string() }),
  ]);

  expect(schema.parse({ type: "1", val: "val" })).toEqual({ type: "1", val: "val" });
  expect(schema.parse({ type: 1, val: "val" })).toEqual({ type: 1, val: "val" });
  expect(schema.parse({ type: BigInt(1), val: "val" })).toEqual({
    type: BigInt(1),
    val: "val",
  });
  expect(schema.parse({ type: "true", val: "val" })).toEqual({
    type: "true",
    val: "val",
  });
  expect(schema.parse({ type: true, val: "val" })).toEqual({
    type: true,
    val: "val",
  });
  expect(schema.parse({ type: "null", val: "val" })).toEqual({
    type: "null",
    val: "val",
  });
  expect(schema.parse({ type: null, val: "val" })).toEqual({
    type: null,
    val: "val",
  });
  expect(schema.parse({ type: "undefined", val: "val" })).toEqual({
    type: "undefined",
    val: "val",
  });
  expect(schema.parse({ type: undefined, val: "val" })).toEqual({
    type: undefined,
    val: "val",
  });

  const fail = schema.safeParse({
    type: "not_a_key",
    val: "val",
  });
  expect(fail.error).toBeInstanceOf(z.ZodError);
});

test("invalid - null", () => {
  try {
    z.discriminatedUnion([
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ]).parse(null);
    throw new Error();
  } catch (e: any) {
    // [
    //   {
    //     code: z.ZodIssueCode.invalid_type,
    //     expected: z.ZodParsedType.object,
    //     input: null,
    //     message: "Expected object, received null",
    //     received: z.ZodParsedType.null,
    //     path: [],
    //   },
    // ];
    expect(e).toMatchInlineSnapshot(`
      ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "message": "Invalid input: expected object",
            "path": [],
          },
        ],
      }
    `);
  }
});

test("invalid discriminator value", () => {
  const result = z
    .discriminatedUnion([
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ])
    .safeParse({ type: "x", a: "abc" });

  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_union",
            "errors": [],
            "message": "Invalid input",
            "note": "No matching discriminator",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("invalid discriminator value - unionFallback", () => {
  const result = z
    .discriminatedUnion(
      [z.object({ type: z.literal("a"), a: z.string() }), z.object({ type: z.literal("b"), b: z.string() })],
      { unionFallback: true }
    )
    .safeParse({ type: "x", a: "abc" });
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_union",
            "errors": [
              [
                {
                  "code": "invalid_value",
                  "message": "Invalid input: expected "a"",
                  "path": [
                    "type",
                  ],
                  "values": [
                    "a",
                  ],
                },
              ],
              [
                {
                  "code": "invalid_value",
                  "message": "Invalid input: expected "b"",
                  "path": [
                    "type",
                  ],
                  "values": [
                    "b",
                  ],
                },
                {
                  "code": "invalid_type",
                  "expected": "string",
                  "message": "Invalid input: expected string",
                  "path": [
                    "b",
                  ],
                },
              ],
            ],
            "message": "Invalid input",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("valid discriminator value, invalid data", () => {
  const result = z
    .discriminatedUnion([
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ])
    .safeParse({ type: "a", b: "abc" });

  // [
  //   {
  //     code: z.ZodIssueCode.invalid_type,
  //     expected: z.ZodParsedType.string,
  //     message: "Required",
  //     path: ["a"],
  //     received: z.ZodParsedType.undefined,
  //   },
  // ];
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string",
            "path": [
              "a",
            ],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("wrong schema - missing discriminator", () => {
  try {
    z.discriminatedUnion([z.object({ type: z.literal("a"), a: z.string() }), z.object({ b: z.string() }) as any])._disc;
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("Invalid discriminated union option")).toBe(true);
  }
});

// removed to account for unions of unions
// test("wrong schema - duplicate discriminator values", () => {
//   try {
//     z.discriminatedUnion([
//       z.object({ type: z.literal("a"), a: z.string() }),
//       z.object({ type: z.literal("a"), b: z.string() }),
//     ]);
//     throw new Error();
//   } catch (e: any) {
//     expect(e.message.includes("Duplicate discriminator value")).toEqual(true);
//   }
// });

test("async - valid", async () => {
  expect(
    await z
      .discriminatedUnion([
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
  // try {
  const a = z.discriminatedUnion([
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
  ]);
  const result = await a.safeParseAsync({ type: "a", a: 1 });

  // expect(JSON.parse(e.message)).toEqual([
  //   {
  //     code: "invalid_type",
  //     expected: "string",
  //     input: 1,
  //     received: "number",
  //     path: ["a"],
  //     message: "Expected string, received number",
  //   },
  // ]);
  expect(result.error).toMatchInlineSnapshot(`
    ZodError {
      "issues": [
        {
          "code": "invalid_type",
          "expected": "string",
          "message": "Invalid input: expected string",
          "path": [
            "a",
          ],
        },
      ],
    }
  `);
});

test("valid - literals with .default or .pipe", () => {
  const schema = z.discriminatedUnion([
    z.object({
      type: z.literal("foo").default("foo"),
      a: z.string(),
    }),
    z.object({
      type: z.literal("custom"),
      method: z.string(),
    }),
    z.object({
      type: z.literal("bar").transform((val) => val),
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
    d = 0,
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
      key: z.literal("b").$brand<"asdfasdf">(),
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
  expectTypeOf<schema>().toEqualTypeOf<{ key?: "a" | undefined; a: true } | { key: "b" | null; b: true }>();

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
