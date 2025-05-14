import { expect, test } from "vitest";

import * as z from "zod/v4";

test("string to number pipe", () => {
  const schema = z.string().transform(Number).pipe(z.number());
  expect(schema.parse("1234")).toEqual(1234);
});

test("string to number pipe async", async () => {
  const schema = z
    .string()
    .transform(async (val) => Number(val))
    .pipe(z.number());
  expect(await schema.parseAsync("1234")).toEqual(1234);
});

test("continue on non-fatal errors", () => {
  const schema = z
    .string()
    .refine((c) => c === "1234", "A")
    .transform((val) => Number(val))
    .refine((c) => c === 1234, "B");

  schema.parse("1234");

  expect(schema.safeParse("4321")).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "A",
            "path": [],
          },
          {
            "code": "custom",
            "message": "B",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});

test("break on fatal errors", () => {
  const schema = z
    .string()
    .refine((c) => c === "1234", { message: "A", abort: true })
    .transform((val) => Number(val))
    .refine((c) => c === 1234, "B");

  schema.parse("1234");

  expect(schema.safeParse("4321")).toMatchInlineSnapshot(`
    {
      "error": ZodError {
        "issues": [
          {
            "code": "custom",
            "message": "A",
            "path": [],
          },
        ],
      },
      "success": false,
    }
  `);
});
