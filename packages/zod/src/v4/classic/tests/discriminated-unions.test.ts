import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test("_values", () => {
  expect(z.string()._zod.values).toEqual(undefined);
  expect(z.enum(["a", "b"])._zod.values).toEqual(new Set(["a", "b"]));
  expect(z.nativeEnum({ a: "A", b: "B" })._zod.values).toEqual(new Set(["A", "B"]));
  expect(z.literal("test")._zod.values).toEqual(new Set(["test"]));
  expect(z.literal(123)._zod.values).toEqual(new Set([123]));
  expect(z.literal(true)._zod.values).toEqual(new Set([true]));
  expect(z.literal(BigInt(123))._zod.values).toEqual(new Set([BigInt(123)]));
  expect(z.undefined()._zod.values).toEqual(new Set([undefined]));
  expect(z.null()._zod.values).toEqual(new Set([null]));

  const t = z.literal("test");
  expect(t.optional()._zod.values).toEqual(new Set(["test", undefined]));
  expect(t.nullable()._zod.values).toEqual(new Set(["test", null]));
  expect(t.default("test")._zod.values).toEqual(new Set(["test"]));
  expect(t.catch("test")._zod.values).toEqual(new Set(["test"]));

  const pre = z.preprocess((val) => String(val), z.string()).pipe(z.literal("test"));
  expect(pre._zod.values).toEqual(undefined);

  const post = z.literal("test").transform((_) => Math.random());
  expect(post._zod.values).toEqual(new Set(["test"]));

  // Test that readonly literals pass through their values property
  expect(z.literal("test").readonly()._zod.values).toEqual(new Set(["test"]));
});

test("valid parse - object", () => {
  expect(
    z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.string() }),
        z.object({ type: z.literal("b"), b: z.string() }),
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
  const schema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a").optional(), a: z.string() }),
    z.object({ type: z.literal("b"), b: z.string() }),
  ]);
  expect(schema.parse({ type: "a", a: "abc" })).toEqual({ type: "a", a: "abc" });
  expect(schema.parse({ a: "abc" })).toEqual({ a: "abc" });
});

test("valid - discriminator value of various primitive types", () => {
  const schema = z.discriminatedUnion("type", [
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
    z.discriminatedUnion("type", [
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
    expect(e.issues).toMatchInlineSnapshot(`
      [
        {
          "code": "invalid_type",
          "expected": "object",
          "message": "Invalid input: expected object, received null",
          "path": [],
        },
      ]
    `);
  }
});

test("invalid discriminator value", () => {
  const result = z
    .discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ])
    .safeParse({ type: "x", a: "abc" });

  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "invalid_union",
        "errors": [],
        "note": "No matching discriminator",
        "discriminator": "type",
        "options": [
          "a",
          "b"
        ],
        "path": [
          "type"
        ],
        "message": "Invalid discriminator value. Expected 'a' | 'b'"
      }
    ]],
      "success": false,
    }
  `);
});

test("invalid discriminator value - unionFallback", () => {
  const result = z
    .discriminatedUnion(
      "type",
      [z.object({ type: z.literal("a"), a: z.string() }), z.object({ type: z.literal("b"), b: z.string() })],
      { unionFallback: true }
    )
    .safeParse({ type: "x", a: "abc" });
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "invalid_union",
        "errors": [
          [
            {
              "code": "invalid_value",
              "values": [
                "a"
              ],
              "path": [
                "type"
              ],
              "message": "Invalid input: expected \\"a\\""
            }
          ],
          [
            {
              "code": "invalid_value",
              "values": [
                "b"
              ],
              "path": [
                "type"
              ],
              "message": "Invalid input: expected \\"b\\""
            },
            {
              "expected": "string",
              "code": "invalid_type",
              "path": [
                "b"
              ],
              "message": "Invalid input: expected string, received undefined"
            }
          ]
        ],
        "path": [],
        "message": "Invalid input"
      }
    ]],
      "success": false,
    }
  `);
});

test("valid discriminator value, invalid data", () => {
  const result = z
    .discriminatedUnion("type", [
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
      "error": [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [
          "a"
        ],
        "message": "Invalid input: expected string, received undefined"
      }
    ]],
      "success": false,
    }
  `);
});

test("wrong schema - missing discriminator", () => {
  // An option whose properties can be listed is checked when the union is constructed.
  expect(() => z.discriminatedUnion("type", [z.object({ value: z.string() })])).toThrow(
    /Invalid discriminated union option at index "0"/
  );
  expect(() =>
    z.discriminatedUnion("type", [z.object({ type: z.literal("a"), a: z.string() }), z.object({ b: z.string() })])
  ).toThrow(/Invalid discriminated union option at index "1"/);

  // An option whose shape cannot be listed without resolving it — a pipe here — is left to the lookup map, and fails on the first object parsed.
  const viaPipe = z.discriminatedUnion("type", [
    z.object({ value: z.literal("x") }).pipe(z.object({ value: z.literal("x") })),
  ]);
  expect(() => viaPipe.safeParse({ value: "x" })).toThrow(/Invalid discriminated union option at index "0"/);
});

test("the construction check follows shape through both of its phases", () => {
  // `shape` answers from the object the caller passed until the first read, then from a frozen copy. A key list derived at either moment would disagree with it at the other and reject an option that does carry the discriminator.
  const mutatedBeforeRead: Record<string, z.ZodType> = { value: z.string() };
  const A = z.object(mutatedBeforeRead);
  mutatedBeforeRead.type = z.literal("a");
  expect(
    z.discriminatedUnion("type", [A, z.object({ type: z.literal("b") })]).parse({ type: "a", value: "x" })
  ).toEqual({ type: "a", value: "x" });

  const mutatedAfterRead: Record<string, z.ZodType> = { type: z.literal("a"), value: z.string() };
  const B = z.object(mutatedAfterRead);
  B.parse({ type: "a", value: "x" });
  delete mutatedAfterRead.type;
  expect(() => z.discriminatedUnion("type", [B])).not.toThrow();
});

test("deriving a schema neither clobbers nor is inherited by the source", () => {
  // `.describe()` and friends reuse the def by identity, so the source keeps its own check.
  const A = z.object({ value: z.literal("x") });
  A.describe("just documenting this");
  expect(() => z.discriminatedUnion("type", [A])).toThrow(/Invalid discriminated union option/);
  expect(() => z.discriminatedUnion("type", [A.describe("d")])).toThrow(/Invalid discriminated union option/);

  // A def rebuilt by a builder is a different object, so it inherits nothing and is left to the lookup map.
  const Base = z.object({ status: z.literal("failed"), message: z.string() });
  expect(() => z.discriminatedUnion("code", [Base.extend({ code: z.literal(400) })])).not.toThrow();
});

test("mutually-recursive getter options are checked without resolving them", () => {
  // `Object.keys` lists a shape's keys without invoking them, so the check sees `child` without running the getter that references the union being constructed.
  const variantA = z.object({
    kind: z.literal("a"),
    get child() {
      return tree.optional();
    },
  });
  const variantB = z.object({
    kind: z.literal("b"),
    get sibling() {
      return tree.optional();
    },
  });
  const tree = z.discriminatedUnion("kind", [variantA, variantB]);

  expect(tree.parse({ kind: "a", child: { kind: "b" } })).toEqual({ kind: "a", child: { kind: "b" } });
});

// removed to account for unions of unions
// test("wrong schema - duplicate discriminator values", () => {
//   try {
//     z.discriminatedUnion("type",[
//       z.object({ type: z.literal("a"), a: z.string() }),
//       z.object({ type: z.literal("a"), b: z.string() }),
//     ]);
//     throw new Error();
//   } catch (e: any) {
//     expect(e.message.includes("Duplicate discriminator value")).toEqual(true);
//   }
// });

test("async - valid", async () => {
  const schema = await z.discriminatedUnion("type", [
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
  ]);
  const data = { type: "a", a: "1" };
  const result = await schema.safeParseAsync(data);
  expect(result.data).toEqual({ type: "a", a: 1 });
});

test("async - invalid", async () => {
  // try {
  const a = z.discriminatedUnion("type", [
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
    [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [
          "a"
        ],
        "message": "Invalid input: expected string, received number"
      }
    ]]
  `);
});

test("valid - literals with .default or .pipe", () => {
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
  expectTypeOf<schema>().toEqualTypeOf<{ key: "a" } | { key: "b" | "c" } | { key: MyEnum.d | MyEnum.e }>();

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
      key: z.literal("b").brand<"asdfasdf">(),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;
  expectTypeOf<schema>().toEqualTypeOf<{ key: "a" } | { key: "b" & z.core.$brand<"asdfasdf"> }>();

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

test("multiple discriminators", () => {
  const FreeConfig = z.object({
    type: z.literal("free"),
    min_cents: z.null(),
  });

  // console.log(FreeConfig.shape.type);
  const PricedConfig = z.object({
    type: z.literal("fiat-price"),
    // min_cents: z.int().nullable(),
    min_cents: z.null(),
  });

  const Config = z.discriminatedUnion("type", [FreeConfig, PricedConfig]);

  Config.parse({
    min_cents: null,
    type: "fiat-price",
    name: "Standard",
  });

  expect(() => {
    Config.parse({
      min_cents: null,
      type: "not real",
      name: "Standard",
    });
  }).toThrow();
});

test("single element union", () => {
  const schema = z.object({
    a: z.literal("discKey"),
    b: z.enum(["apple", "banana"]),
    c: z.object({ id: z.string() }),
  });

  const input = {
    a: "discKey",
    b: "apple",
    c: {}, // Invalid, as schema requires `id` property
  };

  // Validation must fail here, but it doesn't

  const u = z.discriminatedUnion("a", [schema]);
  const result = u.safeParse(input);
  expect(result).toMatchObject({ success: false });
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [
          "c",
          "id"
        ],
        "message": "Invalid input: expected string, received undefined"
      }
    ]],
      "success": false,
    }
  `);

  expect(u.options.length).toEqual(1);
});

test("nested discriminated unions", () => {
  const BaseError = z.object({ status: z.literal("failed"), message: z.string() });
  const MyErrors = z.discriminatedUnion("code", [
    BaseError.extend({ code: z.literal(400) }),
    BaseError.extend({ code: z.literal(401) }),
    BaseError.extend({ code: z.literal(500) }),
  ]);

  const MyResult = z.discriminatedUnion("status", [
    z.object({ status: z.literal("success"), data: z.string() }),
    MyErrors,
  ]);

  expect(MyErrors._zod.propValues).toMatchInlineSnapshot(`
    {
      "code": Set {
        400,
        401,
        500,
      },
      "status": Set {
        "failed",
      },
    }
  `);
  expect(MyResult._zod.propValues).toMatchInlineSnapshot(`
    {
      "code": Set {
        400,
        401,
        500,
      },
      "status": Set {
        "success",
        "failed",
      },
    }
  `);

  const result = MyResult.parse({ status: "success", data: "hello" });
  expect(result).toMatchInlineSnapshot(`
    {
      "data": "hello",
      "status": "success",
    }
  `);
  const result2 = MyResult.parse({ status: "failed", code: 400, message: "bad request" });
  expect(result2).toMatchInlineSnapshot(`
    {
      "code": 400,
      "message": "bad request",
      "status": "failed",
    }
  `);
  const result3 = MyResult.parse({ status: "failed", code: 401, message: "unauthorized" });
  expect(result3).toMatchInlineSnapshot(`
    {
      "code": 401,
      "message": "unauthorized",
      "status": "failed",
    }
  `);
  const result4 = MyResult.parse({ status: "failed", code: 500, message: "internal server error" });
  expect(result4).toMatchInlineSnapshot(`
    {
      "code": 500,
      "message": "internal server error",
      "status": "failed",
    }
  `);
});

test("readonly literal discriminator", () => {
  const discUnion = z.discriminatedUnion("type", [
    z.object({ type: z.literal("a").readonly(), a: z.string() }),
    z.object({ type: z.literal("b"), b: z.number() }),
  ]);

  // Test that both discriminator values are correctly included in propValues
  const propValues = discUnion._zod.propValues;
  expect(propValues?.type?.has("a")).toBe(true);
  expect(propValues?.type?.has("b")).toBe(true);

  // Test that the discriminated union works correctly
  const result1 = discUnion.parse({ type: "a", a: "hello" });
  expect(result1).toEqual({ type: "a", a: "hello" });

  const result2 = discUnion.parse({ type: "b", b: 42 });
  expect(result2).toEqual({ type: "b", b: 42 });

  // Test that invalid discriminator values are rejected
  expect(() => {
    discUnion.parse({ type: "c", a: "hello" });
  }).toThrow();
});

test("pipes", () => {
  const schema = z
    .object({
      type: z.literal("foo"),
    })
    .transform((s) => ({ ...s, v: 2 }));

  expect(schema._zod.propValues).toMatchInlineSnapshot(`
    {
      "type": Set {
        "foo",
      },
    }
  `);

  const schema2 = z.object({
    type: z.literal("bar"),
  });

  const combinedSchema = z.discriminatedUnion("type", [schema, schema2], {
    unionFallback: false,
  });

  combinedSchema.parse({
    type: "foo",
    v: 2,
  });
});

test("def", () => {
  const schema = z.discriminatedUnion(
    "type",
    [z.object({ type: z.literal("play") }), z.object({ type: z.literal("pause") })],
    { unionFallback: true }
  );

  expect(schema.def).toBeDefined();
  expect(schema.def.discriminator).toEqual("type");
  expect(schema.def.unionFallback).toEqual(true);
});

test("encode with codec discriminator", () => {
  const codec1 = z.codec(z.literal(1), z.literal("one"), {
    decode: () => "one" as const,
    encode: () => 1 as const,
  });

  const codec2 = z.codec(z.literal(2), z.literal("two"), {
    decode: () => "two" as const,
    encode: () => 2 as const,
  });

  const schema = z.discriminatedUnion("type", [
    z.object({ type: codec1, value: z.string() }),
    z.object({ type: codec2, value: z.number() }),
  ]);

  // decode (forward) should work
  const decoded = schema.decode({ type: 1, value: "hello" });
  expect(decoded).toEqual({ type: "one", value: "hello" });

  // encode (backward) should also work — the discriminator values differ between forward (1, 2) and backward ("one", "two") directions
  const encoded = z.encode(schema, { type: "one", value: "hello" });
  expect(encoded).toEqual({ type: 1, value: "hello" });
});

test("getDiscriminatedOption", () => {
  const fruit = z.object({ type: z.literal("fruit"), seeds: z.boolean() });
  const veg = z.object({ type: z.literal("vegetable"), leafy: z.boolean() });
  const schema = z.discriminatedUnion("type", [fruit, veg]);

  expect(z.getDiscriminatedOption(schema, "fruit")).toBe(fruit);
  expect(z.getDiscriminatedOption(schema, "vegetable")).toBe(veg);

  // The result is narrowed to the one member, not the union of all of them.
  expectTypeOf(z.getDiscriminatedOption(schema, "fruit")).toEqualTypeOf<typeof fruit>();
  expectTypeOf(z.getDiscriminatedOption(schema, "vegetable")).toEqualTypeOf<typeof veg>();
  // @ts-expect-error — "unknown" is not a declared discriminator value
  z.getDiscriminatedOption(schema, "unknown");
});

test("getDiscriminatedOption — multi-value members and non-string discriminators", () => {
  const a = z.object({ type: z.literal(["x", "y"]), payload: z.string() });
  const b = z.object({ type: z.literal("z"), payload: z.number() });
  const multi = z.discriminatedUnion("type", [a, b]);
  expect(z.getDiscriminatedOption(multi, "x")).toBe(a);
  expect(z.getDiscriminatedOption(multi, "y")).toBe(a);
  expect(z.getDiscriminatedOption(multi, "z")).toBe(b);

  const num = z.object({ type: z.literal(1) });
  const bool = z.object({ type: z.literal(true) });
  const nul = z.object({ type: z.null() });
  const mixed = z.discriminatedUnion("type", [num, bool, nul]);
  expect(z.getDiscriminatedOption(mixed, 1)).toBe(num);
  expect(z.getDiscriminatedOption(mixed, true)).toBe(bool);
  expect(z.getDiscriminatedOption(mixed, null)).toBe(nul);

  // An omittable discriminator claims undefined, so it resolves like any other value.
  const opt = z.object({ type: z.literal("a").optional(), a: z.string() });
  const req = z.object({ type: z.literal("b"), b: z.string() });
  expect(z.getDiscriminatedOption(z.discriminatedUnion("type", [opt, req]), undefined)).toBe(opt);
});

test("getDiscriminatedOption caches in the bag and costs nothing until called", () => {
  const schema = z.discriminatedUnion("type", [z.object({ type: z.literal("a") }), z.object({ type: z.literal("b") })]);

  expect(schema._zod.bag.optionsMap).toBeUndefined();
  expect(z.getDiscriminatedOption(schema, "a")).toBe(schema.options[0]);
  const map = schema._zod.bag.optionsMap;
  expect(map).toBeInstanceOf(Map);
  expect(z.getDiscriminatedOption(schema, "b")).toBe(schema.options[1]);
  expect(schema._zod.bag.optionsMap).toBe(map);

  // A clone recomputes rather than inheriting the cache.
  expect(schema.clone()._zod.bag.optionsMap).toBeUndefined();
});

test.each(["__proto__", "constructor", "toString", "hasOwnProperty", "valueOf"])(
  "Object.prototype discriminator name: %s",
  (key) => {
    const first = z.object({ [key]: z.literal("a"), value: z.string() });
    const second = z.object({ [key]: z.literal("b"), value: z.number() });
    const schema = z.discriminatedUnion(key, [first, second]);

    expect(schema._zod.propValues?.[key]).toEqual(new Set(["a", "b"]));

    const input = Object.fromEntries([
      [key, "a"],
      ["value", "ok"],
    ]);
    const parsed: any = schema.parse(input);
    expect(Object.prototype.hasOwnProperty.call(parsed, key)).toBe(key !== "__proto__");
    if (key !== "__proto__") expect(parsed[key]).toBe("a");
    expect(parsed.value).toBe("ok");
  }
);

// An omittable discriminator reads back as undefined at the lookup, exactly as TypeScript sees it: `{ k?: "a" } | { k?: "c" }` does not narrow on `k === undefined`.
test("an omittable discriminator claims undefined", () => {
  const omittable = [z.exactOptional(z.literal("a")), z.optional(z.literal("a")), z.literal("a").default("a")];
  for (const k of omittable) {
    expect(z.object({ k })._zod.propValues.k).toEqual(new Set(["a", undefined]));
  }

  // one option omits the key: it claims undefined, so an absent key routes there and the union agrees
  const options = [
    z.object({ k: z.exactOptional(z.literal("a")), x: z.string() }),
    z.object({ k: z.literal("b"), y: z.number() }),
  ] as const;
  expect(z.discriminatedUnion("k", options).safeParse({ x: "s" }).success).toEqual(true);
  expect(z.union(options).safeParse({ x: "s" }).success).toEqual(true);
  expect(z.discriminatedUnion("k", options).safeParse({ k: "b", y: 1 }).success).toEqual(true);

  // two options omit the key: both claim undefined, so they are not discriminable on it
  for (const k of omittable) {
    expect(() =>
      z.discriminatedUnion("k", [z.object({ k }), z.object({ k: z.exactOptional(z.literal("c")) })]).parse({})
    ).toThrow(/Duplicate discriminator value "undefined"/);
  }
});
