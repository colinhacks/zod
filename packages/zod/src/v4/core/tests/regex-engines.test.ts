import { RE2JS } from "re2js"; // RE2 engine
import { afterEach, describe, expect, test } from "vitest";
import * as z from "zod/v4";

describe("Pluggable Regex Engines", () => {
  // Reset back to native RegExp after each test
  afterEach(() => {
    z.config({ regexTester: undefined });
  });

  describe("Compatibility checks", () => {
    const testCases = () => {
      // Standard string formats
      const emailSchema = z.email();
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("invalid-email").success).toBe(false);

      // Custom Regexes
      const customRegex = z.string().regex(/^[0-9A-F]{4}$/i);
      expect(customRegex.safeParse("1A3F").success).toBe(true);
      expect(customRegex.safeParse("XYZW").success).toBe(false);

      // UUIDs
      const uuidSchema = z.uuid();
      expect(uuidSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(true);
      expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    };

    test("Native RegExp works", () => {
      testCases();
    });

    test("RE2JS (pure JS) works seamlessly (except lookahead/lookbehind)", () => {
      z.config({
        regexTester: (nativeRegex) => {
          try {
            // Attempt to compile with strict O(n) RE2JS engine
            return RE2JS.compile(nativeRegex.source);
          } catch {
            // Zod's internal email and URL regexes use lookaheads.
            // Catch the RE2 syntax error and seamlessly fallback to native RegExp.
            return nativeRegex;
          }
        },
      });
      testCases();
    });
  });

  describe("ReDoS vulnerability protection", () => {
    // A catastrophic backtracking regex
    const vulnerableRegex = /^([a-z]+)+$/;

    // A massive payload. If the regex engine uses backtracking (O(2^n)),
    // evaluating this string will completely freeze the CI runner until a hard timeout.
    const maliciousPayload = "a".repeat(50000) + "!";

    test("Injected RE2JS correctly evaluates catastrophic payload without hanging", () => {
      z.config({
        regexTester: (regex) => RE2JS.compile(regex.source),
      });

      const schema = z.string().regex(vulnerableRegex);

      // The functional assertion: This line must actually complete.
      // If the engine isn't safe, the test runner will freeze here.
      const result = schema.safeParse(maliciousPayload);

      // Assert that it correctly identified the string as invalid
      expect(result.success).toBe(false);
    });
  });
});
