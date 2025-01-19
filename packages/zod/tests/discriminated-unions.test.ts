// @ts-ignore TS6133
import { expect, test } from "vitest";
import * as util from "zod-core/util";

import * as z from "../src/index.js";

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
    expect(e).toMatchInlineSnapshot(`
      $ZodError {
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
    .discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ])
    .safeParse({ type: "x", a: "abc" });

  // [
  //   {
  //     code: z.ZodIssueCode.invalid_union_discriminator,
  //     input: { type: "x", a: "abc" },
  //     options: ["a", "b"],
  //     message: "Invalid discriminator value. Expected 'a' | 'b'",
  //     path: ["type"],
  //   },
  // ];
  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
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
      "type",
      [z.object({ type: z.literal("a"), a: z.string() }), z.object({ type: z.literal("b"), b: z.string() })],
      { unionFallback: true }
    )
    .safeParse({ type: "x", a: "abc" });
  expect(result).toMatchInlineSnapshot(`
    {
      "error": $ZodError {
        "issues": [
          {
            "code": "invalid_union",
            "errors": [
              [
                {
                  "code": "invalid_value",
                  "message": "Invalid option: expected one of 'a'",
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
                  "message": "Invalid option: expected one of 'b'",
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
      "error": $ZodError {
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
    $ZodError {
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
      key: z.literal("b").brand<"asdfasdf">(),
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
  util.assertEqual<schema, { key?: "a" | undefined; a: true } | { key: "b" | null; b: true }>(true);

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
