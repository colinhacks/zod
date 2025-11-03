import { describe, expect, it } from "vitest";
import * as z from "../classic/index.js";

/**
 * Tests to ensure _zod.getJSONSchema() produces the same output as z.toJSONSchema()
 * for simple cases (no $defs, no custom registry, input mode).
 */

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

function assertEqualSchemas(_name: string, schema: any) {
  const lite = schema._zod.getJSONSchema(testContext);
  const full = z.toJSONSchema(schema, { io: "input" });

  // Remove $schema for comparison since lite version doesn't include it
  const fullWithoutSchema = { ...full };
  delete fullWithoutSchema.$schema;

  expect(lite).toEqual(fullWithoutSchema);
}

describe("JSON Schema Equality Tests", () => {
  describe("Primitives", () => {
    it("string", () => {
      assertEqualSchemas("string", z.string());
    });

    it("string with constraints", () => {
      assertEqualSchemas("string with constraints", z.string().min(5).max(10));
    });

    it("email", () => {
      assertEqualSchemas("email", z.email());
    });

    it("url", () => {
      assertEqualSchemas("url", z.url());
    });

    it("uuid", () => {
      assertEqualSchemas("uuid", z.uuid());
    });

    it("number", () => {
      assertEqualSchemas("number", z.number());
    });

    it("number with constraints", () => {
      assertEqualSchemas("number with constraints", z.number().min(0).max(100));
    });

    it("number with exclusive constraints", () => {
      assertEqualSchemas("number with exclusive constraints", z.number().gt(0).lt(100));
    });

    it("integer", () => {
      assertEqualSchemas("integer", z.int());
    });

    it("boolean", () => {
      assertEqualSchemas("boolean", z.boolean());
    });

    it("null", () => {
      assertEqualSchemas("null", z.null());
    });
  });

  describe("Arrays", () => {
    it("array of strings", () => {
      assertEqualSchemas("array of strings", z.array(z.string()));
    });

    it("array with constraints", () => {
      assertEqualSchemas("array with constraints", z.array(z.string()).min(1).max(5));
    });

    it("nested array", () => {
      assertEqualSchemas("nested array", z.array(z.array(z.number())));
    });
  });

  describe("Objects", () => {
    it("simple object", () => {
      assertEqualSchemas(
        "simple object",
        z.object({
          name: z.string(),
          age: z.number(),
        })
      );
    });

    it("object with optional field", () => {
      assertEqualSchemas(
        "object with optional field",
        z.object({
          name: z.string(),
          age: z.number().optional(),
        })
      );
    });

    it("nested object", () => {
      assertEqualSchemas(
        "nested object",
        z.object({
          user: z.object({
            name: z.string(),
            email: z.email(),
          }),
          metadata: z.object({
            created: z.string(),
            updated: z.string().optional(),
          }),
        })
      );
    });

    it("empty object", () => {
      assertEqualSchemas("empty object", z.object({}));
    });
  });

  describe("Unions", () => {
    it("string or number", () => {
      assertEqualSchemas("string or number", z.union([z.string(), z.number()]));
    });

    it("complex union", () => {
      assertEqualSchemas("complex union", z.union([z.string(), z.number(), z.object({ type: z.literal("obj") })]));
    });

    it("nullable", () => {
      assertEqualSchemas("nullable", z.string().nullable());
    });
  });

  describe("Enums and Literals", () => {
    it("string enum", () => {
      assertEqualSchemas("string enum", z.enum(["red", "green", "blue"]));
    });

    it("mixed enum", () => {
      assertEqualSchemas("mixed enum", z.enum(["active", "inactive"]));
    });

    it("string literal", () => {
      assertEqualSchemas("string literal", z.literal("hello"));
    });

    it("number literal", () => {
      assertEqualSchemas("number literal", z.literal(42));
    });

    it("boolean literal", () => {
      assertEqualSchemas("boolean literal", z.literal(true));
    });

    it("null literal", () => {
      assertEqualSchemas("null literal", z.literal(null));
    });
  });

  describe("Tuples", () => {
    it("simple tuple", () => {
      assertEqualSchemas("simple tuple", z.tuple([z.string(), z.number()]));
    });

    it("tuple with optional elements", () => {
      assertEqualSchemas(
        "tuple with optional elements",
        z.tuple([z.string(), z.number().optional(), z.boolean().optional()])
      );
    });

    it("empty tuple", () => {
      assertEqualSchemas("empty tuple", z.tuple([]));
    });
  });

  describe("Records", () => {
    it("record with string keys and number values", () => {
      assertEqualSchemas("record", z.record(z.string(), z.number()));
    });

    it("record with complex values", () => {
      assertEqualSchemas(
        "record with complex values",
        z.record(
          z.string(),
          z.object({
            id: z.number(),
            name: z.string(),
          })
        )
      );
    });
  });

  describe("Wrappers", () => {
    it("optional", () => {
      assertEqualSchemas("optional", z.string().optional());
    });

    it("default", () => {
      assertEqualSchemas("default", z.string().default("hello"));
    });

    it("nullable", () => {
      assertEqualSchemas("nullable", z.string().nullable());
    });

    it("chained wrappers", () => {
      assertEqualSchemas("chained wrappers", z.string().optional().nullable());
    });
  });

  describe("Complex Combinations", () => {
    it("complex nested schema", () => {
      assertEqualSchemas(
        "complex nested schema",
        z.object({
          users: z.array(
            z.object({
              id: z.number(),
              name: z.string().min(1),
              email: z.email(),
              role: z.enum(["admin", "user", "guest"]),
              metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
            })
          ),
          pagination: z.object({
            page: z.number().min(1),
            limit: z.number().min(1).max(100),
            total: z.number(),
          }),
          filters: z
            .object({
              search: z.string().optional(),
              status: z.enum(["active", "inactive"]).optional(),
            })
            .optional(),
        })
      );
    });
  });
});
