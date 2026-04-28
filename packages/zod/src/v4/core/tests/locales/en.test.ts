import { beforeEach, describe, expect, test } from "vitest";
import { z } from "../../../../index.js";
import en from "../../../locales/en.js";
import { parsedType } from "../../util.js";

// `en` is the default locale, so its messages are also Zod's reference output.
// These tests double as a regression suite for any locale change and document
// the canonical message format that translations should mirror.

test("parsedType", () => {
  expect(parsedType("string")).toBe("string");
  expect(parsedType(1)).toBe("number");
  expect(parsedType(true)).toBe("boolean");
  expect(parsedType(null)).toBe("null");
  expect(parsedType(undefined)).toBe("undefined");
  expect(parsedType([])).toBe("array");
  expect(parsedType({})).toBe("object");
  expect(parsedType(new Date())).toBe("Date");
  expect(parsedType(new Map())).toBe("Map");
  expect(parsedType(new Set())).toBe("Set");
  expect(parsedType(new Error())).toBe("Error");

  const nullPrototype = Object.create(null);
  expect(parsedType(nullPrototype)).toBe("object");

  const doubleNullPrototype = Object.create(Object.create(null));
  expect(parsedType(doubleNullPrototype)).toBe("object");
});

describe("English locale", () => {
  beforeEach(() => {
    z.config(en());
  });

  describe("invalid_type", () => {
    test("string expected, number received", () => {
      const result = z.string().safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected string, received number");
      }
    });

    test("number expected, string received", () => {
      const result = z.number().safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected number, received string");
      }
    });

    test("boolean expected, null received", () => {
      const result = z.boolean().safeParse(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected boolean, received null");
      }
    });

    test("array expected, object received", () => {
      const result = z.array(z.string()).safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected array, received object");
      }
    });

    test("nan expected -> NaN (TypeDictionary mapping)", () => {
      const result = z.nan().safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected NaN, received number");
      }
    });

    test("instanceof Date (capitalized expected)", () => {
      const result = z.instanceof(Date).safeParse("not a date");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected instanceof Date, received string");
      }
    });

    test("instanceof custom class (capitalized expected)", () => {
      class Foo {}
      const result = z.instanceof(Foo).safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input: expected instanceof Foo, received object");
      }
    });
  });

  describe("invalid_value", () => {
    test("literal (single value)", () => {
      const result = z.literal("hello").safeParse("world");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid input: expected "hello"');
      }
    });

    test("enum (multiple values)", () => {
      const result = z.enum(["a", "b", "c"]).safeParse("d");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid option: expected one of "a"|"b"|"c"');
      }
    });
  });

  describe("too_small", () => {
    test("string min", () => {
      const result = z.string().min(5).safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too small: expected string to have >=5 characters");
      }
    });

    test("number min (inclusive)", () => {
      const result = z.number().min(10).safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too small: expected number to be >=10");
      }
    });

    test("number gt (exclusive)", () => {
      const result = z.number().gt(10).safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too small: expected number to be >10");
      }
    });

    test("array min", () => {
      const result = z.array(z.string()).min(3).safeParse(["a", "b"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too small: expected array to have >=3 items");
      }
    });

    test("set min", () => {
      const result = z
        .set(z.string())
        .min(2)
        .safeParse(new Set(["a"]));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too small: expected set to have >=2 items");
      }
    });
  });

  describe("too_big", () => {
    test("string max", () => {
      const result = z.string().max(3).safeParse("abcde");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too big: expected string to have <=3 characters");
      }
    });

    test("number max (inclusive)", () => {
      const result = z.number().max(10).safeParse(15);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too big: expected number to be <=10");
      }
    });

    test("number lt (exclusive)", () => {
      const result = z.number().lt(10).safeParse(15);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too big: expected number to be <10");
      }
    });

    test("array max", () => {
      const result = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Too big: expected array to have <=2 items");
      }
    });
  });

  describe("invalid_format", () => {
    test("regex", () => {
      const result = z
        .string()
        .regex(/^[a-z]+$/)
        .safeParse("ABC123");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid string: must match pattern /^[a-z]+$/");
      }
    });

    test("starts_with", () => {
      const result = z.string().startsWith("hello").safeParse("world");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid string: must start with "hello"');
      }
    });

    test("ends_with", () => {
      const result = z.string().endsWith("world").safeParse("hello");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid string: must end with "world"');
      }
    });

    test("includes", () => {
      const result = z.string().includes("test").safeParse("hello");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid string: must include "test"');
      }
    });

    test("email (FormatDictionary lookup)", () => {
      const result = z.email().safeParse("not-an-email");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    test("url (FormatDictionary lookup)", () => {
      const result = z.url().safeParse("not a url");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid URL");
      }
    });

    test("uuid (FormatDictionary lookup)", () => {
      const result = z.uuid().safeParse("not-a-uuid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid UUID");
      }
    });
  });

  describe("not_multiple_of", () => {
    test("multipleOf", () => {
      const result = z.number().multipleOf(3).safeParse(10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid number: must be a multiple of 3");
      }
    });
  });

  describe("unrecognized_keys", () => {
    test("single key", () => {
      const schema = z.object({ a: z.string() }).strict();
      const result = schema.safeParse({ a: "test", b: "extra" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Unrecognized key: "b"');
      }
    });

    test("multiple keys", () => {
      const schema = z.object({ a: z.string() }).strict();
      const result = schema.safeParse({ a: "test", b: "extra", c: "another" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Unrecognized keys: "b", "c"');
      }
    });
  });

  describe("invalid_key", () => {
    test("record with non-numeric key", () => {
      const schema = z.record(z.number(), z.string());
      const result = schema.safeParse({ notANumber: "value" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_key");
        expect(result.error.issues[0].message).toBe("Invalid key in record");
      }
    });
  });

  describe("invalid_element", () => {
    test("map with invalid value", () => {
      const schema = z.map(z.bigint(), z.number());
      const result = schema.safeParse(new Map([[BigInt(123), BigInt(123)]]));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_element");
        expect(result.error.issues[0].message).toBe("Invalid value in map");
      }
    });
  });

  describe("invalid_union", () => {
    test("union with no matching member", () => {
      const result = z.union([z.string(), z.number()]).safeParse(true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input");
      }
    });
  });

  describe("custom", () => {
    test("default custom message falls through to 'Invalid input'", () => {
      const schema = z.string().refine(() => false);
      const result = schema.safeParse("anything");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid input");
      }
    });
  });
});
