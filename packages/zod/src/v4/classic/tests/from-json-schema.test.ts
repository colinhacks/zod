import { expect, test } from "vitest";
import { fromJSONSchema } from "../from-json-schema.js";

test("basic string schema", () => {
  const schema = fromJSONSchema({ type: "string" });
  expect(schema.parse("hello")).toBe("hello");
  expect(() => schema.parse(123)).toThrow();
});

test("string with constraints", () => {
  const schema = fromJSONSchema({
    type: "string",
    minLength: 3,
    maxLength: 10,
    pattern: "^[a-z]+$",
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(schema.parse("helloworld")).toBe("helloworld"); // exactly 10 chars - valid
  expect(() => schema.parse("hi")).toThrow(); // too short
  expect(() => schema.parse("helloworld1")).toThrow(); // too long (11 chars)
  expect(() => schema.parse("Hello")).toThrow(); // pattern mismatch
});

test("pattern is not implicitly anchored", () => {
  // JSON Schema patterns match anywhere in the string, not just the full string
  const schema = fromJSONSchema({
    type: "string",
    pattern: "foo",
  });
  expect(schema.parse("foo")).toBe("foo");
  expect(schema.parse("foobar")).toBe("foobar"); // matches at start
  expect(schema.parse("barfoo")).toBe("barfoo"); // matches at end
  expect(schema.parse("barfoobar")).toBe("barfoobar"); // matches in middle
  expect(() => schema.parse("bar")).toThrow(); // no match
});

test("number schema", () => {
  const schema = fromJSONSchema({ type: "number" });
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse("42")).toThrow();
});

test("number with constraints", () => {
  const schema = fromJSONSchema({
    type: "number",
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
  });
  expect(schema.parse(50)).toBe(50);
  expect(() => schema.parse(-1)).toThrow();
  expect(() => schema.parse(101)).toThrow();
  expect(() => schema.parse(47)).toThrow(); // not multiple of 5
});

test("integer schema", () => {
  const schema = fromJSONSchema({ type: "integer" });
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse(42.5)).toThrow();
});

test("boolean schema", () => {
  const schema = fromJSONSchema({ type: "boolean" });
  expect(schema.parse(true)).toBe(true);
  expect(schema.parse(false)).toBe(false);
  expect(() => schema.parse("true")).toThrow();
});

test("null schema", () => {
  const schema = fromJSONSchema({ type: "null" });
  expect(schema.parse(null)).toBe(null);
  expect(() => schema.parse(undefined)).toThrow();
});

test("object schema", () => {
  const schema = fromJSONSchema({
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
    },
    required: ["name"],
  });
  expect(schema.parse({ name: "John", age: 30 })).toEqual({ name: "John", age: 30 });
  expect(schema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(() => schema.parse({ age: 30 })).toThrow(); // missing required
});

test("object with additionalProperties false", () => {
  const schema = fromJSONSchema({
    type: "object",
    properties: {
      name: { type: "string" },
    },
    additionalProperties: false,
  });
  expect(schema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(() => schema.parse({ name: "John", extra: "field" })).toThrow();
});

test("array schema", () => {
  const schema = fromJSONSchema({
    type: "array",
    items: { type: "string" },
  });
  expect(schema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  expect(() => schema.parse([1, 2, 3])).toThrow();
});

test("array with constraints", () => {
  const schema = fromJSONSchema({
    type: "array",
    items: { type: "number" },
    minItems: 2,
    maxItems: 4,
  });
  expect(schema.parse([1, 2])).toEqual([1, 2]);
  expect(schema.parse([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  expect(() => schema.parse([1])).toThrow();
  expect(() => schema.parse([1, 2, 3, 4, 5])).toThrow();
});

test("tuple with prefixItems (draft-2020-12)", () => {
  const schema = fromJSONSchema({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "array",
    prefixItems: [{ type: "string" }, { type: "number" }],
  });
  expect(schema.parse(["hello", 42])).toEqual(["hello", 42]);
  expect(() => schema.parse(["hello"])).toThrow();
  expect(() => schema.parse(["hello", "world"])).toThrow();
});

test("tuple with items array (draft-7)", () => {
  const schema = fromJSONSchema({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    items: [{ type: "string" }, { type: "number" }],
    additionalItems: false,
  });
  expect(schema.parse(["hello", 42])).toEqual(["hello", 42]);
  expect(() => schema.parse(["hello", 42, "extra"])).toThrow();
});

test("enum schema", () => {
  const schema = fromJSONSchema({
    enum: ["red", "green", "blue"],
  });
  expect(schema.parse("red")).toBe("red");
  expect(() => schema.parse("yellow")).toThrow();
});

test("const schema", () => {
  const schema = fromJSONSchema({
    const: "hello",
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(() => schema.parse("world")).toThrow();
});

test("anyOf schema", () => {
  const schema = fromJSONSchema({
    anyOf: [{ type: "string" }, { type: "number" }],
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse(true)).toThrow();
});

test("allOf schema", () => {
  const schema = fromJSONSchema({
    allOf: [
      { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
      { type: "object", properties: { age: { type: "number" } }, required: ["age"] },
    ],
  });
  const result = schema.parse({ name: "John", age: 30 }) as { name: string; age: number };
  expect(result.name).toBe("John");
  expect(result.age).toBe(30);
});

test("allOf with empty array", () => {
  // Empty allOf without explicit type returns any
  const schema1 = fromJSONSchema({
    allOf: [],
  });
  expect(schema1.parse("hello")).toBe("hello");
  expect(schema1.parse(123)).toBe(123);
  expect(schema1.parse({})).toEqual({});

  // Empty allOf with explicit type returns base schema
  const schema2 = fromJSONSchema({
    type: "string",
    allOf: [],
  });
  expect(schema2.parse("hello")).toBe("hello");
  expect(() => schema2.parse(123)).toThrow();
});

test("oneOf schema (exclusive union)", () => {
  const schema = fromJSONSchema({
    oneOf: [{ type: "string" }, { type: "number" }],
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse(true)).toThrow();
});

test("type with anyOf creates intersection", () => {
  // type: string AND (type:string,minLength:5 OR type:string,pattern:^a)
  const schema = fromJSONSchema({
    type: "string",
    anyOf: [
      { type: "string", minLength: 5 },
      { type: "string", pattern: "^a" },
    ],
  });
  // Should pass: string AND (minLength:5 OR pattern:^a) - matches minLength
  expect(schema.parse("hello")).toBe("hello");
  // Should pass: string AND (minLength:5 OR pattern:^a) - matches pattern
  expect(schema.parse("abc")).toBe("abc");
  // Should fail: string but neither minLength nor pattern match
  expect(() => schema.parse("hi")).toThrow();
  // Should fail: not a string
  expect(() => schema.parse(123)).toThrow();
});

test("type with oneOf creates intersection", () => {
  // type: string AND (exactly one of: type:string,minLength:5 OR type:string,pattern:^a)
  const schema = fromJSONSchema({
    type: "string",
    oneOf: [
      { type: "string", minLength: 5 },
      { type: "string", pattern: "^a" },
    ],
  });
  // Should pass: string AND minLength:5 (exactly one match - "hello" length 5 >= 5, doesn't start with 'a')
  expect(schema.parse("hello")).toBe("hello");
  // Should pass: string AND pattern:^a (exactly one match - "abc" starts with 'a', length 3 < 5)
  expect(schema.parse("abc")).toBe("abc");
  // Should fail: string but neither match
  expect(() => schema.parse("hi")).toThrow();
  // Should fail: not a string
  expect(() => schema.parse(123)).toThrow();
  // Should fail: matches both (length >= 5 AND starts with 'a') - exclusive union fails
  expect(() => schema.parse("apple")).toThrow();
});

test("unevaluatedItems throws error", () => {
  expect(() => {
    fromJSONSchema({
      type: "array",
      unevaluatedItems: false,
    });
  }).toThrow("unevaluatedItems is not supported");
});

test("unevaluatedProperties throws error", () => {
  expect(() => {
    fromJSONSchema({
      type: "object",
      unevaluatedProperties: false,
    });
  }).toThrow("unevaluatedProperties is not supported");
});

test("if/then/else throws error", () => {
  expect(() => {
    fromJSONSchema({
      if: { type: "string" },
      then: { type: "number" },
    });
  }).toThrow("Conditional schemas");
});

test("external $ref throws error", () => {
  expect(() => {
    fromJSONSchema({
      $ref: "https://example.com/schema#/definitions/User",
    });
  }).toThrow("External $ref is not supported");
});

test("local $ref resolution", () => {
  const schema = fromJSONSchema({
    $defs: {
      User: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
    },
    $ref: "#/$defs/User",
  });
  expect(schema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(() => schema.parse({})).toThrow();
});

test("circular $ref with lazy", () => {
  const schema = fromJSONSchema({
    $defs: {
      Node: {
        type: "object",
        properties: {
          value: { type: "string" },
          children: {
            type: "array",
            items: { $ref: "#/$defs/Node" },
          },
        },
      },
    },
    $ref: "#/$defs/Node",
  });
  type Node = { value: string; children: Node[] };
  const result = schema.parse({
    value: "root",
    children: [{ value: "child", children: [] }],
  }) as Node;
  expect(result.value).toBe("root");
  expect(result.children[0]?.value).toBe("child");
});

test("patternProperties", () => {
  const schema = fromJSONSchema({
    type: "object",
    patternProperties: {
      "^S_": { type: "string" },
    },
  });
  const result = schema.parse({ S_name: "John", S_age: "30" }) as Record<string, string>;
  expect(result.S_name).toBe("John");
  expect(result.S_age).toBe("30");
});

test("patternProperties with regular properties", () => {
  // Note: When patternProperties is combined with properties, the intersection
  // validates all keys against the pattern. This test uses a pattern that
  // matches the regular property name as well.
  const schema = fromJSONSchema({
    type: "object",
    properties: {
      S_name: { type: "string" },
    },
    patternProperties: {
      "^S_": { type: "string" },
    },
    required: ["S_name"],
  });
  const result = schema.parse({ S_name: "John", S_extra: "value" }) as Record<string, string>;
  expect(result.S_name).toBe("John");
  expect(result.S_extra).toBe("value");
});

test("multiple patternProperties", () => {
  const schema = fromJSONSchema({
    type: "object",
    patternProperties: {
      "^S_": { type: "string" },
      "^N_": { type: "number" },
    },
  });
  const result = schema.parse({ S_name: "John", N_count: 123 }) as Record<string, string | number>;
  expect(result.S_name).toBe("John");
  expect(result.N_count).toBe(123);
  // Keys not matching any pattern should pass through
  const result2 = schema.parse({ S_name: "John", N_count: 123, other: "value" }) as Record<string, string | number>;
  expect(result2.other).toBe("value");
});

test("multiple overlapping patternProperties", () => {
  // If a key matches multiple patterns, value must satisfy all schemas
  const schema = fromJSONSchema({
    type: "object",
    patternProperties: {
      "^S_": { type: "string" },
      "^S_N": { type: "string", minLength: 3 },
    },
  });
  // S_name matches ^S_ but not ^S_N
  expect(schema.parse({ S_name: "John" })).toEqual({ S_name: "John" });
  // S_N matches both patterns - must satisfy both (string with minLength 3)
  expect(schema.parse({ S_N: "abc" })).toEqual({ S_N: "abc" });
  expect(() => schema.parse({ S_N: "ab" })).toThrow(); // too short for ^S_N pattern
});

test("default value", () => {
  const schema = fromJSONSchema({
    type: "string",
    default: "hello",
  });
  // Default is applied during parsing if value is missing/undefined
  // This depends on Zod's default behavior
  expect(schema.parse("world")).toBe("world");
});

test("description metadata", () => {
  const schema = fromJSONSchema({
    type: "string",
    description: "A string value",
  });
  expect(schema.parse("hello")).toBe("hello");
});

test("version detection - draft-2020-12", () => {
  const schema = fromJSONSchema({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "array",
    prefixItems: [{ type: "string" }],
  });
  expect(schema.parse(["hello"])).toEqual(["hello"]);
});

test("version detection - draft-7", () => {
  const schema = fromJSONSchema({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    items: [{ type: "string" }],
  });
  expect(schema.parse(["hello"])).toEqual(["hello"]);
});

test("version detection - draft-4", () => {
  const schema = fromJSONSchema({
    $schema: "http://json-schema.org/draft-04/schema#",
    type: "array",
    items: [{ type: "string" }],
  });
  expect(schema.parse(["hello"])).toEqual(["hello"]);
});

test("default version (draft-2020-12)", () => {
  const schema = fromJSONSchema({
    type: "array",
    prefixItems: [{ type: "string" }],
  });
  expect(schema.parse(["hello"])).toEqual(["hello"]);
});

test("string format - email", () => {
  const schema = fromJSONSchema({
    type: "string",
    format: "email",
  });
  expect(schema.parse("test@example.com")).toBe("test@example.com");
});

test("string format - uuid", () => {
  const schema = fromJSONSchema({
    type: "string",
    format: "uuid",
  });
  const uuid = "550e8400-e29b-41d4-a716-446655440000";
  expect(schema.parse(uuid)).toBe(uuid);
});

test("exclusiveMinimum and exclusiveMaximum", () => {
  const schema = fromJSONSchema({
    type: "number",
    exclusiveMinimum: 0,
    exclusiveMaximum: 100,
  });
  expect(schema.parse(50)).toBe(50);
  expect(() => schema.parse(0)).toThrow();
  expect(() => schema.parse(100)).toThrow();
});

test("boolean schema (true/false)", () => {
  const trueSchema = fromJSONSchema(true);
  expect(trueSchema.parse("anything")).toBe("anything");

  const falseSchema = fromJSONSchema(false);
  expect(() => falseSchema.parse("anything")).toThrow();
});

test("empty object schema", () => {
  const schema = fromJSONSchema({
    type: "object",
  });
  expect(schema.parse({})).toEqual({});
  expect(schema.parse({ extra: "field" })).toEqual({ extra: "field" });
});

test("array without items", () => {
  const schema = fromJSONSchema({
    type: "array",
  });
  expect(schema.parse([1, "string", true])).toEqual([1, "string", true]);
});

test("mixed enum types", () => {
  const schema = fromJSONSchema({
    enum: ["string", 42, true, null],
  });
  expect(schema.parse("string")).toBe("string");
  expect(schema.parse(42)).toBe(42);
  expect(schema.parse(true)).toBe(true);
  expect(schema.parse(null)).toBe(null);
});

test("nullable in OpenAPI 3.0", () => {
  // General nullable case (not just enum: [null])
  const stringSchema = fromJSONSchema(
    {
      type: "string",
      nullable: true,
    },
    { defaultTarget: "openapi-3.0" }
  );
  expect(stringSchema.parse("hello")).toBe("hello");
  expect(stringSchema.parse(null)).toBe(null);
  expect(() => stringSchema.parse(123)).toThrow();

  const numberSchema = fromJSONSchema(
    {
      type: "number",
      nullable: true,
    },
    { defaultTarget: "openapi-3.0" }
  );
  expect(numberSchema.parse(42)).toBe(42);
  expect(numberSchema.parse(null)).toBe(null);
  expect(() => numberSchema.parse("string")).toThrow();

  const objectSchema = fromJSONSchema(
    {
      type: "object",
      properties: { name: { type: "string" } },
      nullable: true,
    },
    { defaultTarget: "openapi-3.0" }
  );
  expect(objectSchema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(objectSchema.parse(null)).toBe(null);
});
