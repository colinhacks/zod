import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.creditCard", () => {
  // Reference test numbers (Luhn-valid, per-issuer; widely published).
  const valid: [string, string][] = [
    ["Visa", "4111111111111111"],
    ["Visa (16)", "4012888888881881"],
    ["Visa (13)", "4007000000027"],
    ["Mastercard", "5555555555554444"],
    ["AmEx", "378282246310005"],
    ["Discover", "6011111111111117"],
    ["JCB", "3530111333300000"],
    ["Diners Club", "30569309025904"],
    ["UnionPay", "6200000000000005"],
  ];

  test.each(valid)("accepts valid %s", (_label, n) => {
    expect(z.creditCard().parse(n)).toBe(n);
  });

  test("accepts whitespace and hyphen separators", () => {
    expect(z.creditCard().parse("4111 1111 1111 1111")).toBe("4111 1111 1111 1111");
    expect(z.creditCard().parse("4111-1111-1111-1111")).toBe("4111-1111-1111-1111");
  });

  test("rejects when Luhn fails (right shape, wrong checksum)", () => {
    // Visa-shape but checksum off by one in the last digit
    expect(() => z.creditCard().parse("4111111111111112")).toThrow();
  });

  test("rejects unknown issuer (Luhn-valid but not in provider list)", () => {
    // 9-prefixed, Luhn-valid, but not matched by any known issuer regex
    expect(() => z.creditCard().parse("9999999999999995")).toThrow();
  });

  test("rejects 13-digit Luhn-valid Mastercard-prefix (regex precedence regression)", () => {
    // `5[1-5]\d{2}|...` without grouping would let 13-digit `5100000000003` through —
    // real Mastercards are always 16 digits.
    expect(() => z.creditCard().parse("5100000000003")).toThrow();
  });

  test("rejects non-digit / wrong-length input", () => {
    expect(() => z.creditCard().parse("not-a-card")).toThrow();
    expect(() => z.creditCard().parse("411111")).toThrow();
    expect(() => z.creditCard().parse("")).toThrow();
  });

  test("error message references credit card", () => {
    const result = z.creditCard().safeParse("not-a-card");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/credit card/i);
    }
  });

  test("composes with other string operations", () => {
    expect(() => z.creditCard().parse("4111111111111111")).not.toThrow();
    const optional = z.creditCard().optional();
    expect(optional.parse(undefined)).toBe(undefined);
    expect(optional.parse("4111111111111111")).toBe("4111111111111111");
  });

  test("z.string().creditCard() chainable form (deprecated, parity with .jwt() / .e164())", () => {
    const schema = z.string().creditCard();
    expect(schema.parse("4111111111111111")).toBe("4111111111111111");
    expect(() => schema.parse("4111111111111112")).toThrow();
    // Composes with other string checks.
    expect(() => z.string().min(20).creditCard().parse("4111111111111111")).toThrow();
  });
});
