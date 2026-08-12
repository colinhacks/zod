import { checkSync } from "recheck";
import { expect, test } from "vitest";
import * as z from "zod/v4";

const { regexes } = z.core;

/** Every pattern `core/regexes.ts` ships, with the parameterized ones materialized across their argument space. */
function allPatterns(): [string, RegExp][] {
  const patterns: [string, RegExp][] = [];
  for (const [name, value] of Object.entries(regexes)) {
    if (value instanceof RegExp) patterns.push([name, value]);
  }

  patterns.push(
    ["emoji()", regexes.emoji()],
    ["mac()", regexes.mac()],
    ["mac('-')", regexes.mac("-")],
    ["uuid()", regexes.uuid()],
    ["string()", regexes.string()],
    ["string({min,max})", regexes.string({ minimum: 1, maximum: 10 })]
  );
  for (const version of [1, 2, 3, 4, 5, 6, 7, 8]) patterns.push([`uuid(${version})`, regexes.uuid(version)]);
  for (const precision of [null, -1, 0, 3, 6]) {
    patterns.push([`time(${precision})`, regexes.time({ precision })]);
    for (const local of [false, true]) {
      for (const offset of [false, true]) {
        patterns.push([`datetime(${precision},${local},${offset})`, regexes.datetime({ precision, local, offset })]);
      }
    }
  }
  return patterns;
}

test("no built-in pattern is ReDoS-vulnerable", () => {
  const patterns = allPatterns();
  // Guards against the reflection above silently going empty if the module layout changes.
  expect(patterns.length).toBeGreaterThan(80);

  const vulnerable: string[] = [];
  for (const [name, pattern] of patterns) {
    // Flags are load-bearing. Without "u" the checker reads `\p{...}` as a literal `p{...}`
    // and reports an exponential pattern as safe.
    const result = checkSync(pattern.source, pattern.flags);
    if (result.status !== "safe") vulnerable.push(`${name} (${result.status}): ${pattern.source}`);
  }
  expect(vulnerable).toEqual([]);
}, 60000);

test("emoji rejects a backtracking payload in linear time", () => {
  // U+1F9B0-U+1F9B3 are the only code points in both \p{Extended_Pictographic} and
  // \p{Emoji_Component}. A failing match over them used to backtrack exponentially:
  // 26 of them took ~1.9s, and each additional character roughly doubled it.
  const start = performance.now();
  expect(z.emoji().safeParse(`${"🦰".repeat(26)} `).success).toBe(false);
  expect(performance.now() - start).toBeLessThan(100);
});
