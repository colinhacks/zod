import { describe, expect, test } from "vitest";
import * as z from "zod/v4";

describe("z.cron()", () => {
  const schema = z.cron();

  describe("should parse valid expressions", () => {
    test("wildcard expressions", () => {
      expect(schema.safeParse("* * * * *").success).toBe(true);
    });

    test("specific values", () => {
      expect(schema.safeParse("0 0 1 1 0").success).toBe(true);
      expect(schema.safeParse("59 23 31 12 6").success).toBe(true);
      expect(schema.safeParse("30 6 15 6 3").success).toBe(true);
    });

    test("step expressions", () => {
      expect(schema.safeParse("*/5 * * * *").success).toBe(true);
      expect(schema.safeParse("*/15 */6 * * *").success).toBe(true);
      expect(schema.safeParse("0 */2 * * *").success).toBe(true);
    });

    test("range expressions", () => {
      expect(schema.safeParse("0-30 * * * *").success).toBe(true);
      expect(schema.safeParse("30 6 * * 1-5").success).toBe(true);
      expect(schema.safeParse("0 9-17 * * 1-5").success).toBe(true);
    });

    test("list expressions", () => {
      expect(schema.safeParse("0,30 * * * *").success).toBe(true);
      expect(schema.safeParse("0 0 1,15 * *").success).toBe(true);
      expect(schema.safeParse("0 8,12,17 * * 1-5").success).toBe(true);
    });

    test("combined expressions", () => {
      expect(schema.safeParse("0-30/5 * * * *").success).toBe(true);
      expect(schema.safeParse("0 0 * 1,6,12 *").success).toBe(true);
    });
  });

  describe("should reject invalid expressions", () => {
    test("empty strings", () => {
      expect(schema.safeParse("").success).toBe(false);
      expect(schema.safeParse(" ").success).toBe(false);
      expect(schema.safeParse("\n").success).toBe(false);
    });

    test("wrong number of fields", () => {
      expect(schema.safeParse("* * *").success).toBe(false); // too few
      expect(schema.safeParse("* * * *").success).toBe(false); // too few
      expect(schema.safeParse("* * * * * *").success).toBe(false); // too many
    });

    test("invalid characters", () => {
      expect(schema.safeParse("abc * * * *").success).toBe(false);
      expect(schema.safeParse("* * * * MON").success).toBe(false);
      expect(schema.safeParse("? * * * *").success).toBe(false);
    });

    test("invalid separators", () => {
      expect(schema.safeParse("* * * * *\t").success).toBe(false); // tab instead of space
      expect(schema.safeParse("***** ").success).toBe(false); // no spaces
    });

    test("out-of-range values", () => {
      expect(schema.safeParse("60 0 1 1 0").success).toBe(false); // minute > 59
      expect(schema.safeParse("0 24 1 1 0").success).toBe(false); // hour > 23
      expect(schema.safeParse("0 0 0 1 0").success).toBe(false); // day < 1
      expect(schema.safeParse("0 0 32 1 0").success).toBe(false); // day > 31
      expect(schema.safeParse("0 0 1 0 0").success).toBe(false); // month < 1
      expect(schema.safeParse("0 0 1 13 0").success).toBe(false); // month > 12
      expect(schema.safeParse("0 0 1 1 7").success).toBe(false); // weekday > 6
      expect(schema.safeParse("99 25 32 13 8").success).toBe(false); // all out of range
    });

    test("invalid ranges", () => {
      expect(schema.safeParse("30-10 * * * *").success).toBe(false); // from > to
      expect(schema.safeParse("0 20-10 * * *").success).toBe(false); // from > to
      expect(schema.safeParse("1-2-3 * * * *").success).toBe(false); // multiple range operators
      expect(schema.safeParse("1- * * * *").success).toBe(false); // trailing dash
    });

    test("invalid step values", () => {
      expect(schema.safeParse("*/0 * * * *").success).toBe(false); // step must be >= 1
      expect(schema.safeParse("0 */0 * * *").success).toBe(false); // step must be >= 1
      expect(schema.safeParse("1/2/3 * * * *").success).toBe(false); // multiple step operators
    });

    test("trailing operators", () => {
      expect(schema.safeParse("1, * * * *").success).toBe(false); // trailing comma
      expect(schema.safeParse("0,30, * * * *").success).toBe(false); // trailing comma in list
    });
  });

  describe("error output", () => {
    test("returns invalid_format error with format: cron", () => {
      const result = schema.safeParse("not-a-cron");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_format");
        expect((result.error.issues[0] as { format: string }).format).toBe("cron");
      }
    });

    test("returns custom error message", () => {
      const withMessage = z.cron("Invalid cron expression");
      const result = withMessage.safeParse("bad");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid cron expression");
      }
    });
  });
});

describe("z.string().cron()", () => {
  const schema = z.string().cron();

  test("valid expression", () => {
    expect(schema.safeParse("* * * * *").success).toBe(true);
    expect(schema.safeParse("0 0 1 1 0").success).toBe(true);
  });

  test("invalid expression", () => {
    expect(schema.safeParse("bad").success).toBe(false);
    expect(schema.safeParse("* * *").success).toBe(false);
  });

  test("non-string input", () => {
    expect(schema.safeParse(null).success).toBe(false);
    expect(schema.safeParse(123).success).toBe(false);
  });
});
