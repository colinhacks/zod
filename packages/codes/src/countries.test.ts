import { expect, expectTypeOf, test } from "vitest";
import { type CountryCode, codes, countries, published, reserved } from "./countries.js";

test("country codes", () => {
  expect(codes.length).toBeGreaterThan(240);
  expect(codes.length).toBeLessThan(260);
  expect(new Set(codes).size).toBe(codes.length);
  expect([...codes]).toEqual([...codes].sort());
  expect(codes).toContain("US");
  expect(codes).not.toContain("EU");
  expect(codes).not.toContain("SU");
  expect(reserved).toContain("EU");
  expect(countries.map((c) => c.code)).toEqual([...codes]);
  expect(countries.find((c) => c.code === "US")).toEqual({
    code: "US",
    alpha3: "USA",
    numeric: "840",
    name: "United States",
  });
  expect(countries.every((c) => /^[A-Z]{3}$/.test(c.alpha3) && /^\d{3}$/.test(c.numeric) && c.name.length > 0)).toBe(
    true
  );
  expect(published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expectTypeOf<"US">().toExtend<CountryCode>();
  expectTypeOf<CountryCode>().toExtend<string>();
});
