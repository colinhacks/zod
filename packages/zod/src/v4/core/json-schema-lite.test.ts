import { describe, expect, it } from "vitest";
import * as z from "../classic/index.js";
import type { JSONSchemaContext } from "./json-schema-lite.js";

const testContext: JSONSchemaContext = {
  io: "input",
  target: "draft-2020-12",
  path: [],
  schemaPath: [],
  unrepresentable: "throw",
  processor: (_schema, context, result) => {
    // Check for unrepresentable types (indicated by _error property)
    if ("_error" in result) {
      if (context.unrepresentable === "throw") {
        throw new Error((result as any)._error as string);
      }
      return {};
    }
    return result;
  },
};

describe("JSON Schema Generation", () => {
  describe("Primitives", () => {
    it("string", () => {
      const schema = z.string();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "type": "string",
        }
      `);
    });

    it("string with minLength", () => {
      const schema = z.string().min(5);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "minLength": 5,
          "type": "string",
        }
      `);
    });

    it("string with maxLength", () => {
      const schema = z.string().max(10);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "maxLength": 10,
          "type": "string",
        }
      `);
    });

    it("string with length constraints", () => {
      const schema = z.string().min(5).max(10);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "maxLength": 10,
          "minLength": 5,
          "type": "string",
        }
      `);
    });

    it("email", () => {
      const schema = z.email();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "format": "email",
          "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
          "type": "string",
        }
      `);
    });

    it("url", () => {
      const schema = z.url();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "format": "uri",
          "type": "string",
        }
      `);
    });

    it("uuid", () => {
      const schema = z.uuid();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "format": "uuid",
          "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
          "type": "string",
        }
      `);
    });

    it("number", () => {
      const schema = z.number();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "type": "number",
        }
      `);
    });

    it("number with min", () => {
      const schema = z.number().min(0);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "minimum": 0,
          "type": "number",
        }
      `);
    });

    it("number with max", () => {
      const schema = z.number().max(100);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "maximum": 100,
          "type": "number",
        }
      `);
    });

    it("number with gt (exclusive)", () => {
      const schema = z.number().gt(0);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "exclusiveMinimum": 0,
          "type": "number",
        }
      `);
    });

    it("number with lt (exclusive)", () => {
      const schema = z.number().lt(100);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "exclusiveMaximum": 100,
          "type": "number",
        }
      `);
    });

    it("int", () => {
      const schema = z.int();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "maximum": 9007199254740991,
          "minimum": -9007199254740991,
          "type": "integer",
        }
      `);
    });

    it("boolean", () => {
      const schema = z.boolean();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "type": "boolean",
        }
      `);
    });

    it("null", () => {
      const schema = z.null();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "type": "null",
        }
      `);
    });

    it("bigint throws", () => {
      const schema = z.bigint();
      expect(() => schema._zod.getJSONSchema(testContext)).toThrow("bigint cannot be represented in JSON Schema");
    });
  });

  describe("Arrays", () => {
    it("array of strings", () => {
      const schema = z.array(z.string());
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "items": {
            "type": "string",
          },
          "type": "array",
        }
      `);
    });

    it("array with minLength", () => {
      const schema = z.array(z.string()).min(1);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "items": {
            "type": "string",
          },
          "minItems": 1,
          "type": "array",
        }
      `);
    });
  });

  describe("Objects", () => {
    it("simple object", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "properties": {
            "age": {
              "type": "number",
            },
            "name": {
              "type": "string",
            },
          },
          "required": [
            "name",
            "age",
          ],
          "type": "object",
        }
      `);
    });

    it("object with optional field", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      });
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "properties": {
            "age": {
              "type": "number",
            },
            "name": {
              "type": "string",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });

    it("nested object", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.email(),
        }),
      });
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "properties": {
            "user": {
              "properties": {
                "email": {
                  "format": "email",
                  "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
                  "type": "string",
                },
                "name": {
                  "type": "string",
                },
              },
              "required": [
                "name",
                "email",
              ],
              "type": "object",
            },
          },
          "required": [
            "user",
          ],
          "type": "object",
        }
      `);
    });
  });

  describe("Unions", () => {
    it("string or number", () => {
      const schema = z.union([z.string(), z.number()]);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
          ],
        }
      `);
    });

    it("nullable", () => {
      const schema = z.string().nullable();
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "null",
            },
          ],
        }
      `);
    });
  });

  describe("Enums", () => {
    it("string enum", () => {
      const schema = z.enum(["red", "green", "blue"]);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "enum": [
            "red",
            "green",
            "blue",
          ],
          "type": "string",
        }
      `);
    });
  });

  describe("Literals", () => {
    it("string literal", () => {
      const schema = z.literal("hello");
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "const": "hello",
          "type": "string",
        }
      `);
    });

    it("number literal", () => {
      const schema = z.literal(42);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "const": 42,
          "type": "number",
        }
      `);
    });
  });

  describe("Tuples", () => {
    it("simple tuple", () => {
      const schema = z.tuple([z.string(), z.number()]);
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "prefixItems": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
          ],
          "type": "array",
        }
      `);
    });
  });

  describe("Records", () => {
    it("record with string values", () => {
      const schema = z.record(z.string(), z.number());
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "additionalProperties": {
            "type": "number",
          },
          "propertyNames": {
            "type": "string",
          },
          "type": "object",
        }
      `);
    });
  });

  describe("Caching", () => {
    it("caches result for same schema instance", () => {
      const schema = z.string();
      const result1 = schema._zod.getJSONSchema(testContext);
      const result2 = schema._zod.getJSONSchema(testContext);
      expect(result1).toBe(result2); // Same object reference
    });

    it("handles recursive schemas", () => {
      const Category: any = z.lazy(() =>
        z.object({
          name: z.string(),
          subcategories: z.array(Category).optional(),
        })
      );

      expect(Category._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "properties": {
            "name": {
              "type": "string",
            },
            "subcategories": {
              "items": [Circular],
              "type": "array",
            },
          },
          "required": [
            "name",
          ],
          "type": "object",
        }
      `);
    });
  });

  describe("Metadata", () => {
    it("includes description from registry", () => {
      const schema = z.string().describe("User's name");
      expect(schema._zod.getJSONSchema(testContext)).toMatchInlineSnapshot(`
        {
          "description": "User's name",
          "type": "string",
        }
      `);
    });
  });

  describe("Unsupported types", () => {
    it("symbol throws", () => {
      const schema = z.symbol();
      expect(() => schema._zod.getJSONSchema(testContext)).toThrow("symbol cannot be represented in JSON Schema");
    });

    it("function throws", () => {
      const schema = z.function();
      expect(() => schema._zod.getJSONSchema(testContext)).toThrow("function cannot be represented in JSON Schema");
    });
  });
});
