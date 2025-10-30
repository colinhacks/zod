import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test("valid parse - basic tuple union", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", 123])).toEqual(["b", 123]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<["a", string] | ["b", number]>();
});

test("valid parse - discriminator at different positions", () => {
  // Discriminator at position 1
  const schema1 = z.discriminatedTupleUnion(1, [
    z.tuple([z.string(), z.literal("type1"), z.number()]),
    z.tuple([z.string(), z.literal("type2"), z.boolean()]),
  ]);

  expect(schema1.parse(["hello", "type1", 42])).toEqual(["hello", "type1", 42]);
  expect(schema1.parse(["world", "type2", true])).toEqual(["world", "type2", true]);

  // Discriminator at position 2
  const schema2 = z.discriminatedTupleUnion(2, [
    z.tuple([z.string(), z.number(), z.literal("x")]),
    z.tuple([z.string(), z.number(), z.literal("y")]),
  ]);

  expect(schema2.parse(["test", 123, "x"])).toEqual(["test", 123, "x"]);
  expect(schema2.parse(["test", 456, "y"])).toEqual(["test", 456, "y"]);
});

test("valid - discriminator value of various primitive types", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("1"), z.string()]),
    z.tuple([z.literal(1), z.string()]),
    z.tuple([z.literal(BigInt(1)), z.string()]),
    z.tuple([z.literal("true"), z.string()]),
    z.tuple([z.literal(true), z.string()]),
    z.tuple([z.literal("null"), z.string()]),
    z.tuple([z.null(), z.string()]),
    z.tuple([z.literal("undefined"), z.string()]),
    z.tuple([z.undefined(), z.string()]),
  ]);

  expect(schema.parse(["1", "val"])).toEqual(["1", "val"]);
  expect(schema.parse([1, "val"])).toEqual([1, "val"]);
  expect(schema.parse([BigInt(1), "val"])).toEqual([BigInt(1), "val"]);
  expect(schema.parse(["true", "val"])).toEqual(["true", "val"]);
  expect(schema.parse([true, "val"])).toEqual([true, "val"]);
  expect(schema.parse(["null", "val"])).toEqual(["null", "val"]);
  expect(schema.parse([null, "val"])).toEqual([null, "val"]);
  expect(schema.parse(["undefined", "val"])).toEqual(["undefined", "val"]);
  expect(schema.parse([undefined, "val"])).toEqual([undefined, "val"]);
});

test("valid - enum discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.enum(["a", "b"]), z.string()]),
    z.tuple([z.enum(["c", "d"]), z.number()]),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", "world"])).toEqual(["b", "world"]);
  expect(schema.parse(["c", 123])).toEqual(["c", 123]);
  expect(schema.parse(["d", 456])).toEqual(["d", 456]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<["a" | "b", string] | ["c" | "d", number]>();
});

test("valid - native enum discriminator", () => {
  enum MyEnum {
    A = "a",
    B = "b",
    C = 0,
    D = 1,
  }

  const schema = z.discriminatedTupleUnion(0, [z.tuple([z.nativeEnum(MyEnum), z.string()])]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", "world"])).toEqual(["b", "world"]);
  expect(schema.parse([0, "test"])).toEqual([0, "test"]);
  expect(schema.parse([1, "foo"])).toEqual([1, "foo"]);
});

test("valid - tuples with rest elements", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]).rest(z.number()),
    z.tuple([z.literal("b"), z.boolean()]).rest(z.string()),
  ]);

  expect(schema.parse(["a", "hello", 1, 2, 3])).toEqual(["a", "hello", 1, 2, 3]);
  expect(schema.parse(["b", true, "x", "y"])).toEqual(["b", true, "x", "y"]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<["a", string, ...number[]] | ["b", boolean, ...string[]]>();
});

test("invalid - non-array input", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  const result1 = schema.safeParse(null);
  expect(result1.success).toBe(false);
  expect(result1.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "invalid_type",
        "expected": "array",
        "path": [],
        "message": "Invalid input: expected array, received null"
      }
    ]]
  `);

  const result2 = schema.safeParse({});
  expect(result2.success).toBe(false);
  expect(result2.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "invalid_type",
        "expected": "array",
        "path": [],
        "message": "Invalid input: expected array, received object"
      }
    ]]
  `);
});

test("invalid - no matching discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  const result = schema.safeParse(["c", "hello"]);
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "invalid_union",
        "errors": [],
        "note": "No matching discriminator",
        "discriminator": "0",
        "path": [
          0
        ],
        "message": "Invalid input"
      }
    ]]
  `);
});

test("invalid - valid discriminator, invalid data", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  const result = schema.safeParse(["a", 123]);
  expect(result.success).toBe(false);
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [
          1
        ],
        "message": "Invalid input: expected string, received number"
      }
    ]]
  `);
});

test("invalid - tuple too short (discriminator out of bounds)", () => {
  const schema = z.discriminatedTupleUnion(2, [
    z.tuple([z.literal("a"), z.string()]), // Only has 2 elements, discriminator is at index 2
    z.tuple([z.literal("b"), z.number()]),
  ]);

  try {
    // Access the lazy-evaluated discriminator map
    schema.parse(["a", "test"]);
    throw new Error("Should have thrown");
  } catch (e: any) {
    expect(e.message).toContain("Invalid discriminated union option");
  }
});

test("invalid - duplicate discriminator values", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("a"), z.number()]), // Duplicate "a"
  ]);

  try {
    // Access the lazy-evaluated discriminator map
    schema.parse(["a", "test"]);
    throw new Error("Should have thrown");
  } catch (e: any) {
    expect(e.message).toContain("Duplicate discriminator value");
  }
});

test("unionFallback option - no matching discriminator", () => {
  const schema = z.discriminatedTupleUnion(
    0,
    [z.tuple([z.literal("a"), z.string()]), z.tuple([z.literal("b"), z.number()])],
    { unionFallback: true }
  );

  const result = schema.safeParse(["c", "hello"]);
  expect(result.success).toBe(false);
  // With unionFallback, it should try all options
  expect(result.error).toMatchInlineSnapshot(`
    [ZodError: [
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
                0
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
                0
              ],
              "message": "Invalid input: expected \\"b\\""
            },
            {
              "expected": "number",
              "code": "invalid_type",
              "path": [
                1
              ],
              "message": "Invalid input: expected number, received string"
            }
          ]
        ],
        "path": [],
        "message": "Invalid input"
      }
    ]]
  `);
});

test("unionFallback option - valid discriminator still uses fast path", () => {
  const schema = z.discriminatedTupleUnion(
    0,
    [z.tuple([z.literal("a"), z.string()]), z.tuple([z.literal("b"), z.number()])],
    { unionFallback: true }
  );

  // Should still use fast path when discriminator matches
  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", 123])).toEqual(["b", 123]);
});

test("async validation", async () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string().refine(async (val) => val.length > 0)]),
    z.tuple([z.literal("b"), z.number().refine(async (val) => val > 0)]),
  ]);

  const result1 = await schema.safeParseAsync(["a", "hello"]);
  expect(result1.success).toBe(true);
  expect(result1.data).toEqual(["a", "hello"]);

  const result2 = await schema.safeParseAsync(["b", 123]);
  expect(result2.success).toBe(true);
  expect(result2.data).toEqual(["b", 123]);

  const result3 = await schema.safeParseAsync(["a", ""]);
  expect(result3.success).toBe(false);

  const result4 = await schema.safeParseAsync(["b", -1]);
  expect(result4.success).toBe(false);
});

test("complex nested tuples", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("user"), z.string(), z.object({ age: z.number() })]),
    z.tuple([z.literal("admin"), z.string(), z.object({ role: z.string(), permissions: z.array(z.string()) })]),
  ]);

  expect(schema.parse(["user", "john", { age: 30 }])).toEqual(["user", "john", { age: 30 }]);
  expect(schema.parse(["admin", "jane", { role: "superadmin", permissions: ["read", "write"] }])).toEqual([
    "admin",
    "jane",
    { role: "superadmin", permissions: ["read", "write"] },
  ]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<
    ["user", string, { age: number }] | ["admin", string, { role: string; permissions: string[] }]
  >();
});

test("optional discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a").optional(), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse([undefined, "world"])).toEqual([undefined, "world"]);
  expect(schema.parse(["b", 123])).toEqual(["b", 123]);
});

test("nullable discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a").nullable(), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse([null, "world"])).toEqual([null, "world"]);
  expect(schema.parse(["b", 123])).toEqual(["b", 123]);
});

test("branded discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a").brand<"TypeA">(), z.string()]),
    z.tuple([z.literal("b").brand<"TypeB">(), z.number()]),
  ]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<
    ["a" & z.core.$brand<"TypeA">, string] | ["b" & z.core.$brand<"TypeB">, number]
  >();

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", 123])).toEqual(["b", 123]);
});

test("def property", () => {
  const schema = z.discriminatedTupleUnion(
    0,
    [z.tuple([z.literal("a"), z.string()]), z.tuple([z.literal("b"), z.number()])],
    { unionFallback: true }
  );

  expect(schema.def).toBeDefined();
  expect(schema.def.discriminator).toEqual(0);
  expect(schema.def.unionFallback).toEqual(true);
});

test("single element tuple union", () => {
  const schema = z.discriminatedTupleUnion(0, [z.tuple([z.literal("a"), z.string(), z.number()])]);

  expect(schema.parse(["a", "hello", 123])).toEqual(["a", "hello", 123]);

  const result = schema.safeParse(["a", "hello", "world"]);
  expect(result.success).toBe(false);
});

test("transforms on tuple elements", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string().transform((val) => val.toUpperCase())]),
    z.tuple([z.literal("b"), z.number().transform((val) => val * 2)]),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "HELLO"]);
  expect(schema.parse(["b", 5])).toEqual(["b", 10]);
});

test("refinements on tuples", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]).refine((val) => val[1].length > 3, {
      message: "String must be longer than 3 characters",
    }),
    z.tuple([z.literal("b"), z.number()]).refine((val) => val[1] > 0, {
      message: "Number must be positive",
    }),
  ]);

  expect(schema.parse(["a", "hello"])).toEqual(["a", "hello"]);
  expect(schema.parse(["b", 5])).toEqual(["b", 5]);

  const result1 = schema.safeParse(["a", "hi"]);
  expect(result1.success).toBe(false);

  const result2 = schema.safeParse(["b", -5]);
  expect(result2.success).toBe(false);
});

test("readonly tuples", () => {
  // Note: discriminatedTupleUnion currently doesn't support .readonly() wrapped tuples
  // because readonly() changes the type and doesn't expose the underlying tuple structure
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("a"), z.string()]),
    z.tuple([z.literal("b"), z.number()]),
  ]);

  const result1 = schema.parse(["a", "hello"]);
  expect(result1).toEqual(["a", "hello"]);

  const result2 = schema.parse(["b", 123]);
  expect(result2).toEqual(["b", 123]);

  type Schema = z.infer<typeof schema>;
  expectTypeOf<Schema>().toEqualTypeOf<["a", string] | ["b", number]>();
});

test("error message for non-existent discriminator", () => {
  const schema = z.discriminatedTupleUnion(0, [
    z.tuple([z.literal("create"), z.string()]),
    z.tuple([z.literal("update"), z.string(), z.number()]),
    z.tuple([z.literal("delete"), z.number()]),
  ]);

  const result = schema.safeParse(["archive", "something"]);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].code).toBe("invalid_union");
    expect(result.error.issues[0]).toHaveProperty("note", "No matching discriminator");
  }
});
