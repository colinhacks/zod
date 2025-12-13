import _Ajv from "ajv";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import * as z from "zod/v4";

// Handle both ESM and CJS default export styles
const Ajv = typeof _Ajv === "function" ? _Ajv : (_Ajv as any).default;

describe("z.jsonSchema() with AJV", () => {
  let originalConfig: z.core.$ZodConfig;

  beforeAll(() => {
    // Save original config
    originalConfig = { ...z.core.globalConfig };
    // Configure AJV
    const ajv = new Ajv();
    z.config({ ajv });
  });

  afterAll(() => {
    // Restore original config
    Object.assign(z.core.globalConfig, originalConfig);
    // Remove ajv if it wasn't originally present
    if (!originalConfig.ajv) {
      delete (z.core.globalConfig as any).ajv;
    }
  });

  test("basic object validation - success", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 0 },
      },
      required: ["name", "age"],
    });

    const result = schema.safeParse({ name: "Colin", age: 30 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Colin", age: 30 });
    }
  });

  test("basic object validation - failure (missing required)", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
      required: ["name", "age"],
    });

    const result = schema.safeParse({ name: "Colin" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      // Required maps to invalid_type with expected: "nonoptional"
      expect(result.error.issues[0].code).toBe("invalid_type");
      expect((result.error.issues[0] as any).expected).toBe("nonoptional");
      expect(result.error.issues[0].path).toEqual(["age"]);
    }
  });

  test("basic object validation - failure (wrong type)", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
    });

    const result = schema.safeParse({ name: "Colin", age: "thirty" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].path).toEqual(["age"]);
    }
  });

  test("nested object path handling", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            profile: {
              type: "object",
              properties: {
                age: { type: "integer" },
              },
            },
          },
        },
      },
    });

    const result = schema.safeParse({
      user: { profile: { age: "not a number" } },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["user", "profile", "age"]);
    }
  });

  test("array index path handling", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "integer" },
        },
      },
    });

    const result = schema.safeParse({ items: [1, 2, "three", 4] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["items", 2]);
    }
  });

  test("schema property is accessible", () => {
    const jsonSchemaObj = {
      type: "object" as const,
      properties: {
        name: { type: "string" as const },
      },
    };
    const schema = z.jsonSchema(jsonSchemaObj);

    expect(schema.schema).toBe(jsonSchemaObj);
  });

  test("schema caching - same object returns cached validator", () => {
    const jsonSchemaObj = {
      type: "object" as const,
      properties: {
        value: { type: "number" as const },
      },
    };

    // Create two schemas with the same object
    const schema1 = z.jsonSchema(jsonSchemaObj);
    const schema2 = z.jsonSchema(jsonSchemaObj);

    // Both should work
    expect(schema1.safeParse({ value: 42 }).success).toBe(true);
    expect(schema2.safeParse({ value: 42 }).success).toBe(true);

    // They reference the same schema object
    expect(schema1.schema).toBe(schema2.schema);
  });

  test("error maps to proper Zod issue type for minimum", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        count: { type: "integer", minimum: 10 },
      },
    });

    const result = schema.safeParse({ count: 5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      // minimum maps to too_small
      expect(issue.code).toBe("too_small");
      expect((issue as any).origin).toBe("number");
      expect((issue as any).minimum).toBe(10);
      expect((issue as any).inclusive).toBe(true);
      expect(issue.path).toEqual(["count"]);
    }
  });

  test("string validation", () => {
    const schema = z.jsonSchema({
      type: "string",
      minLength: 3,
      maxLength: 10,
    });

    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse("hi").success).toBe(false);
    expect(schema.safeParse("this is too long").success).toBe(false);
  });

  test("number validation with constraints", () => {
    const schema = z.jsonSchema({
      type: "number",
      minimum: 0,
      maximum: 100,
      multipleOf: 5,
    });

    expect(schema.safeParse(50).success).toBe(true);
    expect(schema.safeParse(53).success).toBe(false); // not multiple of 5
    expect(schema.safeParse(-5).success).toBe(false); // below minimum
    expect(schema.safeParse(105).success).toBe(false); // above maximum
  });

  test("enum validation", () => {
    const schema = z.jsonSchema({
      type: "string",
      enum: ["red", "green", "blue"],
    });

    expect(schema.safeParse("red").success).toBe(true);
    expect(schema.safeParse("yellow").success).toBe(false);
  });

  test("const validation", () => {
    const schema = z.jsonSchema({
      const: "fixed-value",
    });

    expect(schema.safeParse("fixed-value").success).toBe(true);
    expect(schema.safeParse("other-value").success).toBe(false);
  });

  test("additionalProperties validation", () => {
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    });

    expect(schema.safeParse({ name: "test" }).success).toBe(true);
    expect(schema.safeParse({ name: "test", extra: "field" }).success).toBe(false);
  });

  test("oneOf validation", () => {
    const schema = z.jsonSchema({
      oneOf: [{ type: "string" }, { type: "number" }],
    });

    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse(42).success).toBe(true);
    expect(schema.safeParse(true).success).toBe(false);
  });
});

describe("z.jsonSchema() error handling", () => {
  test("throws when AJV is not configured", () => {
    // Save and clear config
    const savedAjv = z.core.globalConfig.ajv;
    delete (z.core.globalConfig as any).ajv;

    try {
      expect(() => z.jsonSchema({ type: "string" })).toThrow("AJV not configured");
    } finally {
      // Restore
      if (savedAjv) {
        z.core.globalConfig.ajv = savedAjv;
      }
    }
  });
});

describe("JSON Pointer decoding", () => {
  beforeAll(() => {
    const ajv = new Ajv();
    z.config({ ajv });
  });

  test("decodes ~1 to /", () => {
    // Create a schema with a property containing a slash
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        "a/b": { type: "integer" },
      },
    });

    const result = schema.safeParse({ "a/b": "not a number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      // The path should have the decoded slash
      expect(result.error.issues[0].path).toEqual(["a/b"]);
    }
  });

  test("decodes ~0 to ~", () => {
    // Create a schema with a property containing a tilde
    const schema = z.jsonSchema({
      type: "object",
      properties: {
        "a~b": { type: "integer" },
      },
    });

    const result = schema.safeParse({ "a~b": "not a number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      // The path should have the decoded tilde
      expect(result.error.issues[0].path).toEqual(["a~b"]);
    }
  });
});
