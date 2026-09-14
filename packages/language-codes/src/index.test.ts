import { expect, expectTypeOf, test } from "vitest";
import { type LanguageCode, codes, languages, published } from "./index.js";

test("language codes", () => {
  expect(codes.length).toBeGreaterThan(170);
  expect(codes.length).toBeLessThan(200);
  expect(new Set(codes).size).toBe(codes.length);
  expect([...codes]).toEqual([...codes].sort());
  expect(codes).toContain("en");
  expect(codes).not.toContain("iw");
  expect(languages.map((l) => l.code)).toEqual([...codes]);
  expect(languages.find((l) => l.code === "en")).toEqual({ code: "en", name: "English" });
  expect(languages.every((l) => /^[a-z]{2}$/.test(l.code) && l.name.length > 0)).toBe(true);
  expect(published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expectTypeOf<"en">().toExtend<LanguageCode>();
  expectTypeOf<LanguageCode>().toExtend<string>();
});
