import { expect, test } from "vitest";

import * as z from "zod/v4";

test("string format methods", () => {
  const a = z.email().min(10);
  const b = z.email().max(10);
  const c = z.email().length(10);
  const d = z.email().uppercase();
  const e = z.email().lowercase();

  // Positive and negative cases for `a`
  expect(a.safeParse("longemail@example.com").success).toBe(true); // Positive
  expect(a.safeParse("ort@e.co").success).toBe(false); // Negative

  // Positive and negative cases for `b`
  expect(b.safeParse("sho@e.co").success).toBe(true); // Positive
  expect(b.safeParse("longemail@example.com").success).toBe(false); // Negative

  // Positive and negative cases for `c`
  expect(c.safeParse("56780@e.co").success).toBe(true); // Positive
  expect(c.safeParse("shoasdfasdfrt@e.co").success).toBe(false); // Negative

  // Positive and negative cases for `d`
  expect(d.safeParse("EMAIL@EXAMPLE.COM").success).toBe(true); // Positive
  expect(d.safeParse("email@example.com").success).toBe(false); // Negative

  // Positive and negative cases for `e`
  expect(e.safeParse("email@example.com").success).toBe(true); // Positive
  expect(e.safeParse("EMAIL@EXAMPLE.COM").success).toBe(false); // Negative
});

test("z.email() rejects addresses longer than 254 characters (RFC 5321)", () => {
  const schema = z.email();
  // "@example.com" = 12 chars; fill the remaining budget with the local part
  const domain = "@example.com";
  const addr254 = "a".repeat(254 - domain.length) + domain; // exactly 254
  const addr255 = "a".repeat(255 - domain.length) + domain; // exactly 255

  expect(addr254.length).toBe(254);
  expect(addr255.length).toBe(255);

  expect(schema.safeParse(addr254).success).toBe(true);

  const result = schema.safeParse(addr255);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].code).toBe("too_big");
  }
});

test("z.stringFormat", () => {
  const ccRegex = /^(?:\d{14,19}|\d{4}(?: \d{3,6}){2,4}|\d{4}(?:-\d{3,6}){2,4})$/u;

  const a = z
    .stringFormat("creditCard", (val) => ccRegex.test(val), {
      error: `Invalid credit card number`,
    })
    .refine((_) => false, "Also bad");

  expect(a.safeParse("asdf")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "invalid_format",
        "format": "creditCard",
        "path": [],
        "message": "Invalid credit card number"
      },
      {
        "code": "custom",
        "path": [],
        "message": "Also bad"
      }
    ]],
      "success": false,
    }
  `);
  expect(a.safeParse("1234-5678-9012-3456")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "Also bad"
      }
    ]],
      "success": false,
    }
  `);
  expect(a.def.pattern).toMatchInlineSnapshot(`undefined`);

  const b = z
    .stringFormat("creditCard", ccRegex, {
      abort: true,
      error: `Invalid credit card number`,
    })
    .refine((_) => false, "Also bad");

  expect(b.safeParse("asdf")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "invalid_format",
        "format": "creditCard",
        "path": [],
        "message": "Invalid credit card number"
      }
    ]],
      "success": false,
    }
  `);
  expect(b.safeParse("1234-5678-9012-3456")).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "Also bad"
      }
    ]],
      "success": false,
    }
  `);
  expect(b.def.pattern).toMatchInlineSnapshot(
    `/\\^\\(\\?:\\\\d\\{14,19\\}\\|\\\\d\\{4\\}\\(\\?: \\\\d\\{3,6\\}\\)\\{2,4\\}\\|\\\\d\\{4\\}\\(\\?:-\\\\d\\{3,6\\}\\)\\{2,4\\}\\)\\$/u`
  );
});

test("z.hex", () => {
  const hexSchema = z.hex();

  // Valid hex strings
  expect(hexSchema.safeParse("").success).toBe(true); // Empty string is valid hex
  expect(hexSchema.safeParse("123abc").success).toBe(true);
  expect(hexSchema.safeParse("DEADBEEF").success).toBe(true);
  expect(hexSchema.safeParse("0123456789abcdefABCDEF").success).toBe(true);

  // Invalid hex strings
  expect(hexSchema.safeParse("xyz").success).toBe(false);
  expect(hexSchema.safeParse("123g").success).toBe(false);
  expect(hexSchema.safeParse("hello world").success).toBe(false);
  expect(hexSchema.safeParse("123-abc").success).toBe(false);
});
