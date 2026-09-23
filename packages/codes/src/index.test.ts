import { expect, test } from "vitest";
import { country, currency, language } from "./index.js";

test("root namespaces", () => {
  expect(currency.codes).toContain("USD");
  expect(country.codes).toContain("US");
  expect(language.codes).toContain("en");
});
