import { expect, expectTypeOf, test } from "vitest";
import { type CurrencyCode, codes, currencies, published, withdrawn } from "./currencies.js";

test("currency codes", () => {
  expect(codes.length).toBeGreaterThanOrEqual(150);
  expect(codes.length).toBeLessThanOrEqual(220);
  expect(new Set(codes).size).toBe(codes.length);
  expect([...codes]).toEqual([...codes].sort());
  expect(codes).toContain("USD");
  expect(codes).toContain("XCG");
  expect(codes).not.toContain("ANG");
  expect(currencies.map((c) => c.code)).toEqual([...codes]);
  expect(currencies.every((c) => /^[A-Z]{3}$/.test(c.code) && /^\d{3}$/.test(c.numeric))).toBe(true);
  expect(currencies.find((c) => c.code === "JPY")).toEqual({
    code: "JPY",
    numeric: "392",
    name: "Yen",
    minorUnits: 0,
    fund: false,
  });
  expect(currencies.find((c) => c.code === "CLF")).toMatchObject({
    name: "Unidad de Fomento",
    minorUnits: 4,
    fund: true,
  });
  expect(currencies.find((c) => c.code === "XAU")?.minorUnits).toBeNull();
  expect(withdrawn.map((c) => c.code)).toContain("ANG");
  expect(withdrawn.some((c) => codes.includes(c.code as CurrencyCode))).toBe(false);
  expect(withdrawn.every((c) => /^\d{4}/.test(c.withdrawn))).toBe(true);
  expect(published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expectTypeOf<"USD">().toExtend<CurrencyCode>();
  expectTypeOf<CurrencyCode>().toExtend<string>();
  expectTypeOf<"ZZZ">().not.toExtend<CurrencyCode>();
});
