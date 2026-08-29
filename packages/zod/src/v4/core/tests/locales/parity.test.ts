import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { z } from "../../../../index.js";

// Every locale must carry an entry for each key `en` translates. Four keys have drifted this way already — `credit_card` (#5931), `mac` (#5440), `Sizable.map` (#5316) and Hebrew's `uuidv4`/`uuidv6`/`template_literal` — each shipped in `en` and left the rest behind, so the gap only surfaced as a raw key in a user's error message.
//
// The key lists are read out of `en.ts` rather than hardcoded, so adding a format to `en` extends this test automatically. That is the whole point: a hand-maintained list here would miss the next one exactly the way the last four were missed.

const localesDir = fileURLToPath(new URL("../../../locales/", import.meta.url));
const enSource = readFileSync(`${localesDir}en.ts`, "utf8");

function keysIn(source: string, block: string): string[] | null {
  const body = source.match(new RegExp(`const ${block}[^=]*= \\{([\\s\\S]*?)\\n  \\};`))?.[1];
  return body ? [...body.matchAll(/^\s{4}([a-z_0-9]+):/gm)].map((m) => m[1]!) : null;
}

function keysOf(block: string): string[] {
  const keys = keysIn(enSource, block);
  if (!keys) throw new Error(`could not read ${block} out of en.ts`);
  return keys;
}

const locales = z.locales as unknown as Record<string, () => { localeError: z.core.$ZodErrorMap }>;
const names = Object.keys(locales).filter((k) => typeof locales[k] === "function");
const SENTINEL = "zzsentinelzz";

/** True when the locale has no entry for `key`: the message is what the sentinel produces. */
function fallsThrough(locale: string, key: string, build: (k: string) => unknown): boolean {
  const map = locales[locale]!().localeError as (iss: unknown) => string | undefined;
  const real = String(map(build(key)) ?? "");
  const sentinel = String(map(build(SENTINEL)) ?? "");
  return real === sentinel.split(SENTINEL).join(key);
}

const asFormat = (k: string) => ({ code: "invalid_format", format: k, input: "x", path: [] });
const asSize = (k: string) => ({ code: "too_small", origin: k, minimum: 2, inclusive: true, input: null, path: [] });

test.each([
  ["FormatDictionary", keysOf("FormatDictionary"), asFormat],
  ["Sizable", keysOf("Sizable"), asSize],
] as const)("every locale translates each %s key that en translates", (_block, keys, build) => {
  // A key `en` maps to its own name (emoji, nanoid, cuid, cuid2) renders identically whether or not a locale defines it, so omitting it is not drift.
  const required = keys.filter((k) => !fallsThrough("en", k, build));
  const gaps = required.flatMap((k) => names.filter((n) => fallsThrough(n, k, build)).map((n) => `${n}.${k}`));

  expect(gaps).toEqual([]);
});

// The rendered-message check above cannot see a missing `Sizable` key in a locale that translates the origin name through its own dictionary, since the real and sentinel messages then differ for an unrelated reason — which is how five locales sat without `map` and rendered a bare or `undefined` unit. This reads the tables out of the source instead.
test("every locale's Sizable table carries each key en's does", () => {
  const required = keysOf("Sizable");
  const gaps = readdirSync(localesDir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .flatMap((f) => {
      const keys = keysIn(readFileSync(`${localesDir}${f}`, "utf8"), "Sizable");
      return keys ? required.filter((k) => !keys.includes(k)).map((k) => `${f}.${k}`) : [];
    });
  expect(gaps).toEqual([]);
});
