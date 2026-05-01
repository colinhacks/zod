import { expect, test } from "vitest";
import * as z from "zod/v3";

const valid: [string, string][] = [
  ["Visa", "4111111111111111"],
  ["Mastercard", "5555555555554444"],
  ["AmEx", "378282246310005"],
  ["Discover", "6011111111111117"],
  ["JCB", "3530111333300000"],
  ["Diners Club", "30569309025904"],
  ["UnionPay", "6200000000000005"],
];

test.each(valid)("v3 credit card: accepts %s", (_label, n) => {
  expect(z.string().creditCard().parse(n)).toBe(n);
});

test("v3 credit card: accepts whitespace and hyphen separators", () => {
  expect(z.string().creditCard().parse("4111 1111 1111 1111")).toBe("4111 1111 1111 1111");
  expect(z.string().creditCard().parse("4111-1111-1111-1111")).toBe("4111-1111-1111-1111");
});

test("v3 credit card: rejects invalid Luhn / unknown issuer / malformed input", () => {
  const s = z.string().creditCard();
  expect(s.safeParse("4111111111111112").success).toBe(false); // Luhn fails
  expect(s.safeParse("9999999999999995").success).toBe(false); // unknown issuer
  expect(s.safeParse("5100000000003").success).toBe(false); // 13-digit Mastercard prefix (regex precedence)
  expect(s.safeParse("not-a-card").success).toBe(false);
  expect(s.safeParse("411111").success).toBe(false);
  expect(s.safeParse("").success).toBe(false);
});

test("v3 credit card: custom error message", () => {
  const r = z.string().creditCard("Invalid CC").safeParse("not-a-card");
  expect(r.success).toBe(false);
  if (!r.success) expect(r.error.issues[0].message).toBe("Invalid CC");
});

test("v3 credit card: isCreditCard getter", () => {
  expect(z.string().creditCard().isCreditCard).toBe(true);
  expect(z.string().email().isCreditCard).toBe(false);
});
