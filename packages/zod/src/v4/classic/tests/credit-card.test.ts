import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.creditCard", () => {
  // Luhn-valid PANs. The last four are the schemes an issuer allowlist would turn away —
  // validation is shape plus Luhn only, so the BIN is never consulted.
  const valid: [string, string][] = [
    ["Visa", "4111111111111111"],
    ["Visa (13)", "4007000000027"],
    ["Mastercard", "5555555555554444"],
    ["AmEx", "378282246310005"],
    ["Discover", "6011111111111117"],
    ["JCB", "3530111333300000"],
    ["Diners Club", "30569309025904"],
    ["UnionPay", "6200000000000005"],
    ["Mir", "2200000000000004"],
    ["Elo", "6362000000000009"],
    ["Discover 644-649", "6450000000000002"],
    ["Troy", "9792000000000003"],
  ];

  test.each(valid)("accepts %s", (_label, n) => {
    expect(z.creditCard().parse(n)).toBe(n);
  });

  test("accepts single space or hyphen separators", () => {
    expect(z.creditCard().parse("4111 1111 1111 1111")).toBe("4111 1111 1111 1111");
    expect(z.creditCard().parse("4111-1111-1111-1111")).toBe("4111-1111-1111-1111");
  });

  test("rejects other separator shapes", () => {
    for (const n of ["4111  1111 1111 1111", " 4111111111111111", "4111111111111111 ", "4111.1111.1111.1111"]) {
      expect(() => z.creditCard().parse(n)).toThrow();
    }
  });

  test("accepts the 12- and 19-digit length bounds", () => {
    expect(z.creditCard().parse("400000000002")).toBe("400000000002");
    expect(z.creditCard().parse("6250000000000000005")).toBe("6250000000000000005");
  });

  test("rejects Luhn-valid input outside 12-19 digits", () => {
    expect(() => z.creditCard().parse("40000000006")).toThrow();
    expect(() => z.creditCard().parse("40000000000000000002")).toThrow();
  });

  test("rejects when Luhn fails (right shape, wrong checksum)", () => {
    expect(() => z.creditCard().parse("4111111111111112")).toThrow();
  });

  test("rejects non-digit input", () => {
    expect(() => z.creditCard().parse("not-a-card")).toThrow();
    expect(() => z.creditCard().parse("")).toThrow();
  });

  test("carries the shape regex as its JSON Schema pattern", () => {
    // Luhn is not expressible as a pattern, so `pattern` covers length and separators only.
    expect(z.toJSONSchema(z.creditCard())).toMatchObject({
      format: "credit_card",
      pattern: z.regexes.creditCard.source,
    });
  });

  test("round-trips through JSON Schema with the checksum intact", () => {
    const schema = z.fromJSONSchema(z.toJSONSchema(z.creditCard()));
    expect(schema.safeParse("4111111111111111").success).toBe(true);
    expect(schema.safeParse("4111111111111112").success).toBe(false);
  });

  test("error message references credit card", () => {
    const result = z.creditCard().safeParse("not-a-card");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/credit card/i);
    }
  });
});
