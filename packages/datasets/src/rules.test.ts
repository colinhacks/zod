import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { RESERVED, buildCountries } from "./country.js";
import { readCodes } from "./emit.js";
import { parseRegistry } from "./iana.js";
import { assertBand, bump, bumpPart, crossCheck, rewriteRegex, withoutDate } from "./rules.js";

test("release rules", () => {
  expect(bump("1.2.3", "major")).toBe("2.0.0");
  expect(bump("1.2.3", "minor")).toBe("1.3.0");
  expect(bump("1.2.9", "patch")).toBe("1.2.10");
  const delta = (added: string[], removed: string[], changed = true) => ({ changed, added, removed });
  expect(bumpPart([delta([], [], false)])).toBeUndefined();
  expect(bumpPart([delta([], [])])).toBe("patch");
  expect(bumpPart([delta([], []), delta(["X"], [])])).toBe("minor");
  expect(bumpPart([delta(["X"], []), delta([], ["Y"])])).toBe("major");
  expect(withoutDate('export const published = "2026-01-01";\nX')).toBe(
    withoutDate('export const published = "2026-02-02";\nX')
  );
  expect(crossCheck("x", ["a", "sh"], ["a"], ["sh"])).toBeUndefined();
  expect(crossCheck("x", ["a", "c"], ["a", "b"], [])).toBe("x disagrees with Debian iso-codes: missing b, extra c");
  expect(() => assertBand("codes", 5, 10, 20)).toThrow("parsed 5 codes");
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
