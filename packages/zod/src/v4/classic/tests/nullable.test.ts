import { expect, test } from "vitest";

import * as z from "zod/v4";

test(".nullable()", () => {
  const nullable = z.string().nullable();
  expect(nullable.parse(null)).toBe(null);
  expect(nullable.parse("asdf")).toBe("asdf");
  expect(() => nullable.parse(123)).toThrow();
});

test(".nullable unwrap", () => {
  const schema = z.string().nullable();
  expect(schema).toBeInstanceOf(z.ZodNullable);
  expect(schema.unwrap()).toBeInstanceOf(z.ZodString);
});

test("z.null", () => {
  const n = z.null();
  expect(n.parse(null)).toBe(null);
  expect(() => n.parse("asdf")).toThrow();
});

test("direction-aware nullable", () => {
  const schema = z.string().nullable();

  // Forward direction (regular parse): null should be allowed
  expect(schema.parse(null)).toBe(null);

  // Reverse direction (encode): null should NOT be specially handled, should fail validation
  expect(z.safeEncode(schema, null as any)).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [],
        "message": "Invalid input: expected string, received null"
      }
    ]],
      "success": false,
    }
  `);

  // But valid values should still work in reverse
  expect(z.encode(schema, "world")).toBe("world");
});
