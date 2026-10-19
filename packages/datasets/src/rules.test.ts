import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { RESERVED, buildCountries } from "./country.js";
import { readCodes } from "./emit.js";
import { parseRegistry } from "./iana.js";
import { assertBand, assertRetired, bump, bumpPart, crossCheck, planModule, rewriteRegex } from "./rules.js";

test("release rules", () => {
  expect(bump("1.2.3", "minor")).toBe("1.3.0");
  expect(bump("1.2.9", "patch")).toBe("1.2.10");
  const plan = (added: string[], removed: string[], changed = true) => ({ changed, fresh: false, added, removed });
  expect(bumpPart([plan([], [], false)])).toBeUndefined();
  expect(bumpPart([plan([], [])])).toBe("patch");
  expect(bumpPart([plan([], []), plan([], ["X"])])).toBe("minor");
  expect(crossCheck("x", ["a", "sh"], ["a"], ["sh"])).toBeUndefined();
  expect(crossCheck("x", ["a", "c"], ["a", "b"], [])).toBe("x disagrees with Debian iso-codes: missing b, extra c");
  expect(() => assertBand("codes", 5, 10, 20)).toThrow("parsed 5 codes");
  expect(() => assertRetired("currency", ["ANG", "BGN"], ["ANG"])).toThrow("without a retirement record: BGN");
  expect(() => assertRetired("currency", [], [])).not.toThrow();
});

test("a module plan sees data, not dates", () => {
  const module = (date: string, codes: string[]) =>
    `export const published = "${date}";\n\nexport const codes = ${JSON.stringify(codes)} as const;\n`;
  expect(planModule(undefined, module("2026-01-01", ["AD"]), ["AD"])).toEqual({
    changed: true,
    fresh: true,
    added: [],
    removed: [],
  });
  expect(planModule(module("2026-01-01", ["AD"]), module("2026-02-02", ["AD"]), ["AD"]).changed).toBe(false);
  expect(planModule(module("2026-01-01", ["AD", "AE"]), module("2026-02-02", ["AD", "AF"]), ["AD", "AF"])).toEqual({
    changed: true,
    fresh: false,
    added: ["AF"],
    removed: ["AE"],
  });
  expect(() => planModule("nothing", module("2026-01-01", []), [])).toThrow("no codes tuple");
});

test("the zod regex carries the package's currency codes", () => {
  const codes = readCodes(readFileSync(new URL("../../codes/src/currencies.ts", import.meta.url), "utf8")) ?? [];
  const source = readFileSync(new URL("../../zod/src/v4/core/regexes.ts", import.meta.url), "utf8");
  expect(codes.length).toBeGreaterThan(0);
  expect(rewriteRegex(source, codes)).toBe(source);
  expect(rewriteRegex(source, ["AAA"])).toContain("/^(?:AAA)$/");
  expect(() => rewriteRegex("nothing", codes)).toThrow("currencyCode");
});

test("country filters", () => {
  const record = (type: string, subtag: string, extra = "", description = subtag) =>
    `%%\nType: ${type}\nSubtag: ${subtag}\nDescription: ${description}\nAdded: 2005-10-16\n${extra}`;
  const registry = (reserved: readonly string[]) =>
    parseRegistry(
      `File-Date: 2026-01-01\n${record("region", "US")}${record("region", "SU", "Deprecated: 1992-09-03\n")}${record("region", "AA", "", "Private use")}${record("language", "en")}${reserved.map((code) => record("region", code)).join("")}`
    );
  const mappings = new Map([["US", { alpha3: "USA", numeric: "840" }]]);
  const built = buildCountries(registry(RESERVED), mappings);
  expect(built.codes).toEqual(["US"]);
  expect(built.reserved).toEqual([...RESERVED].sort());
  expect(built.warnings).toEqual([]);
  expect(() => buildCountries(registry(RESERVED.slice(1)), mappings)).toThrow(
    "reserved codes missing from the registry: AC"
  );
  expect(buildCountries(registry(RESERVED), new Map())).toMatchObject({
    codes: [],
    warnings: ["CLDR has no alpha-3 or numeric code for US yet, so it is left out"],
  });
});
