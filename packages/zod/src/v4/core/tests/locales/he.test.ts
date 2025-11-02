import { describe, expect, test } from "vitest";
import { z } from "../../../../index.js";
import he from "../../../locales/he.js";

describe("Hebrew localization", () => {
  describe("too_small errors with definite article and gendered verbs", () => {
    test("string type (feminine - צריכה)", () => {
      z.config(he());
      const schema = z.string().min(3);
      const result = schema.safeParse("ab");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קטן מדי: המחרוזת צריכה להיות >=3 אותיות");
      }
    });

    test("number type (masculine - צריך)", () => {
      z.config(he());
      const schema = z.number().min(10);
      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קטן מדי: המספר צריך להיות >=10");
      }
    });

    test("array type (masculine - צריך)", () => {
      z.config(he());
      const schema = z.array(z.string()).min(1);
      const result = schema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קטן מדי: המערך צריך להיות >=1 פריטים");
      }
    });

    test("set type (feminine - צריכה)", () => {
      z.config(he());
      const schema = z.set(z.string()).min(2);
      const result = schema.safeParse(new Set(["a"]));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קטן מדי: הקבוצה צריכה להיות >=2 פריטים");
      }
    });
  });

  describe("too_big errors with definite article and gendered verbs", () => {
    test("string type (feminine - צריכה)", () => {
      z.config(he());
      const schema = z.string().max(3);
      const result = schema.safeParse("abcde");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("גדול מדי: המחרוזת צריכה להיות <=3 אותיות");
      }
    });

    test("number type (masculine - צריך)", () => {
      z.config(he());
      const schema = z.number().max(365);
      const result = schema.safeParse(400);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("גדול מדי: המספר צריך להיות <=365");
      }
    });

    test("array type (masculine - צריך)", () => {
      z.config(he());
      const schema = z.array(z.string()).max(2);
      const result = schema.safeParse(["a", "b", "c"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("גדול מדי: המערך צריך להיות <=2 פריטים");
      }
    });
  });

  describe("invalid_type errors with definite article and gendered verbs", () => {
    test("string expected (feminine), number received", () => {
      z.config(he());
      const schema = z.string();
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: המחרוזת צריכה להיות, התקבל מספר");
      }
    });

    test("number expected (masculine), string received", () => {
      z.config(he());
      const schema = z.number();
      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: המספר צריך להיות, התקבל מחרוזת");
      }
    });

    test("boolean expected (masculine), null received", () => {
      z.config(he());
      const schema = z.boolean();
      const result = schema.safeParse(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: הערך בוליאני צריך להיות, התקבל ערך ריק (null)");
      }
    });

    test("array expected (masculine), object received", () => {
      z.config(he());
      const schema = z.array(z.string());
      const result = schema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: המערך צריך להיות, התקבל אובייקט");
      }
    });

    test("object expected (masculine), array received", () => {
      z.config(he());
      const schema = z.object({ a: z.string() });
      const result = schema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: האובייקט צריך להיות, התקבל מערך");
      }
    });

    test("function expected (feminine), string received", () => {
      z.config(he());
      const schema = z.function();
      const result = schema.safeParse("not a function");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין: הפונקציה צריכה להיות, התקבל מחרוזת");
      }
    });
  });

  describe("gendered verbs consistency", () => {
    test("feminine types use צריכה", () => {
      z.config(he());
      const feminineTypes = [
        { schema: z.string().min(5), input: "abc" },
        { schema: z.set(z.string()).min(2), input: new Set(["a"]) },
      ];

      for (const { schema, input } of feminineTypes) {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("צריכה");
        }
      }
    });

    test("masculine types use צריך", () => {
      z.config(he());
      const masculineTypes = [
        { schema: z.number().min(10), input: 5 },
        { schema: z.array(z.string()).min(2), input: ["a"] },
      ];

      for (const { schema, input } of masculineTypes) {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("צריך");
        }
      }
    });
  });

  describe("invalid_value with enum", () => {
    test("single value", () => {
      z.config(he());
      const schema = z.enum(["a"]);
      const result = schema.safeParse("b");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('קלט לא תקין: צריך "a"');
      }
    });

    test("multiple values", () => {
      z.config(he());
      const schema = z.enum(["a", "b", "c"]);
      const result = schema.safeParse("d");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('קלט לא תקין: צריך אחת מהאפשרויות "a" | "b" | "c"');
      }
    });
  });

  describe("other error types", () => {
    test("not_multiple_of", () => {
      z.config(he());
      const schema = z.number().multipleOf(3);
      const result = schema.safeParse(10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("מספר לא תקין: חייב להיות מכפלה של 3");
      }
    });

    test("unrecognized_keys - single key", () => {
      z.config(he());
      const schema = z.object({ a: z.string() }).strict();
      const result = schema.safeParse({ a: "test", b: "extra" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('מפתח לא מזוהה: "b"');
      }
    });

    test("unrecognized_keys - multiple keys", () => {
      z.config(he());
      const schema = z.object({ a: z.string() }).strict();
      const result = schema.safeParse({ a: "test", b: "extra", c: "more" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('מפתחות לא מזוהים: "b", "c"');
      }
    });

    test("invalid_union", () => {
      z.config(he());
      const schema = z.union([z.string(), z.number()]);
      const result = schema.safeParse(true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("קלט לא תקין");
      }
    });

    test("invalid_key in object", () => {
      z.config(he());
      const schema = z.record(z.number(), z.string());
      const result = schema.safeParse({ notANumber: "value" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("מפתח לא תקין");
      }
    });
  });

  describe("invalid_format with string checks", () => {
    test("startsWith", () => {
      z.config(he());
      const schema = z.string().startsWith("hello");
      const result = schema.safeParse("world");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('המחרוזת חייבת להתחיל ב"hello"');
      }
    });

    test("endsWith", () => {
      z.config(he());
      const schema = z.string().endsWith("world");
      const result = schema.safeParse("hello");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('המחרוזת חייבת להסתיים ב"world"');
      }
    });

    test("includes", () => {
      z.config(he());
      const schema = z.string().includes("test");
      const result = schema.safeParse("hello world");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('המחרוזת חייבת לכלול "test"');
      }
    });

    test("regex", () => {
      z.config(he());
      const schema = z.string().regex(/^[a-z]+$/);
      const result = schema.safeParse("ABC123");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("המחרוזת חייבת להתאים לתבנית /^[a-z]+$/");
      }
    });
  });

  describe("invalid_format with common formats", () => {
    test("email", () => {
      z.config(he());
      const schema = z.string().email();
      const result = schema.safeParse("not-an-email");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("כתובת אימייל לא תקין");
      }
    });

    test("url", () => {
      z.config(he());
      const schema = z.string().url();
      const result = schema.safeParse("not-a-url");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("כתובת רשת לא תקין");
      }
    });

    test("uuid", () => {
      z.config(he());
      const schema = z.string().uuid();
      const result = schema.safeParse("not-a-uuid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("UUID לא תקין");
      }
    });
  });

  describe("tuple validation", () => {
    test("invalid element type in tuple", () => {
      z.config(he());
      const schema = z.tuple([z.string(), z.number()]);
      const result = schema.safeParse(["abc", "not a number"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("המספר צריך להיות");
      }
    });
  });

  describe("inclusive vs exclusive bounds", () => {
    test("inclusive minimum (>=)", () => {
      z.config(he());
      const schema = z.number().min(10);
      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(">=10");
      }
    });

    test("exclusive minimum (>)", () => {
      z.config(he());
      const schema = z.number().gt(10);
      const result = schema.safeParse(10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(">10");
      }
    });

    test("inclusive maximum (<=)", () => {
      z.config(he());
      const schema = z.number().max(10);
      const result = schema.safeParse(15);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("<=10");
      }
    });

    test("exclusive maximum (<)", () => {
      z.config(he());
      const schema = z.number().lt(10);
      const result = schema.safeParse(10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("<10");
      }
    });
  });

  describe("all type names with definite article", () => {
    test("verifies all type translations include definite article", () => {
      z.config(he());
      const types = [
        { schema: z.string(), expected: "המחרוזת", input: 123 },
        { schema: z.number(), expected: "המספר", input: "abc" },
        { schema: z.boolean(), expected: "הערך בוליאני", input: "abc" },
        { schema: z.bigint(), expected: "הBigInt", input: "abc" },
        { schema: z.date(), expected: "התאריך", input: "abc" },
        { schema: z.array(z.any()), expected: "המערך", input: "abc" },
        { schema: z.object({}), expected: "האובייקט", input: "abc" },
        { schema: z.function(), expected: "הפונקציה", input: "abc" },
      ];

      for (const { schema, expected, input } of types) {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(expected);
        }
      }
    });
  });
});
