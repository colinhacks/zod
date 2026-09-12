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
    // Flags are load-bearing. Without "u" the checker reads `\p{...}` as a literal `p{...}` and reports an exponential pattern as safe.
    const result = checkSync(pattern.source, pattern.flags);
    // "unknown" means the checker gave up, not that the pattern is vulnerable.
    if (result.status !== "vulnerable") continue;
    // The fuzz checker derives "vulnerable" from how long an attack string runs, so CPU contention from parallel test files can flip a safe pattern. Confirm with a budget large enough that only real backtracking can exhaust it.
    const confirmed = checkSync(pattern.source, pattern.flags, { attackTimeout: 10_000 });
    if (confirmed.status === "vulnerable") vulnerable.push(`${name}: ${pattern.source}`);
  }
  expect(vulnerable).toEqual([]);
}, 60000);

test("emoji rejects a backtracking payload in linear time", () => {
  // U+1F9B0-U+1F9B3 are the only code points in both \p{Extended_Pictographic} and \p{Emoji_Component}. A failing match over them used to backtrack exponentially: 26 of them took ~1.9s, and each additional character roughly doubled it.
  const schema = z.emoji();
  const payload = `${"🦰".repeat(26)} `;

  // Warm up first, then take the best of three: a cold first call is dominated by JIT and can cost hundreds of times the steady-state match on a loaded machine.
  expect(schema.safeParse(payload).success).toBe(false);
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    schema.safeParse(payload);
    best = Math.min(best, performance.now() - start);
  }

  // The linear pattern matches in well under a millisecond, so this budget leaves three orders of magnitude of headroom for CPU contention while still catching the exponential regression.
  expect(best).toBeLessThan(500);
});
