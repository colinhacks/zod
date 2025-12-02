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

test("oneOf schema (treated like anyOf)", () => {
  const schema = fromJSONSchema({
    oneOf: [{ type: "string" }, { type: "number" }],
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse(true)).toThrow();
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
