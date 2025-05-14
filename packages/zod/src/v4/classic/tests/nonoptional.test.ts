import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test("nonoptional", () => {
  const schema = z.string().nonoptional();
  expectTypeOf<typeof schema._input>().toEqualTypeOf<string>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<string>();

  const result = schema.safeParse(undefined);
  expect(result.success).toBe(false);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received undefined",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("nonoptional with default", () => {
  const schema = z.string().optional().nonoptional();
  expectTypeOf<typeof schema._input>().toEqualTypeOf<string>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<string>();

  const result = schema.safeParse(undefined);
  expect(result.success).toBe(false);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "nonoptional",
            "message": "Invalid input: expected nonoptional, received undefined",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("nonoptional in object", () => {
  const schema = z.object({ hi: z.string().optional().nonoptional() });

  expectTypeOf<typeof schema._input>().toEqualTypeOf<{ hi: string }>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<{ hi: string }>();
  const r1 = schema.safeParse({ hi: "asdf" });
  expect(r1.success).toEqual(true);

  const r2 = schema.safeParse({ hi: undefined });
  // expect(schema.safeParse({ hi: undefined }).success).toEqual(false);
  expect(r2.success).toEqual(false);
  expect(r2.error).toMatchInlineSnapshot(`
    ZodError {
      "issues": [
        {
          "code": "invalid_type",
          "expected": "nonoptional",
          "message": "Invalid input: expected nonoptional, received undefined",
          "path": [
            "hi",
          ],
        },
      ],
    }
  `);

  const r3 = schema.safeParse({});
  expect(r3.success).toEqual(false);
  expect(r3.error).toMatchInlineSnapshot(`
    ZodError {
      "issues": [
        {
          "code": "invalid_type",
          "expected": "nonoptional",
          "message": "Invalid input: expected nonoptional, received undefined",
          "path": [
            "hi",
          ],
        },
      ],
    }
  `);
});
