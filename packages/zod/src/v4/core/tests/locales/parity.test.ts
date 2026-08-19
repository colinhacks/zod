import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { z } from "../../../../index.js";

// Every locale must carry an entry for each key `en` translates. Four keys have drifted this way already — `credit_card` (#5931), `mac` (#5440), `Sizable.map` (#5316) and Hebrew's `uuidv4`/`uuidv6`/`template_literal` — each shipped in `en` and left the rest behind, so the gap only surfaced as a raw key in a user's error message.
//
// The key lists are read out of `en.ts` rather than hardcoded, so adding a format to `en` extends this test automatically. That is the whole point: a hand-maintained list here would miss the next one exactly the way the last four were missed.

const enSource = readFileSync(fileURLToPath(new URL("../../../locales/en.ts", import.meta.url)), "utf8");

function keysOf(block: string): string[] {
  const body = enSource.match(new RegExp(`const ${block}[^=]*= \\{([\\s\\S]*?)\\n  \\};`))?.[1];
  if (!body) throw new Error(`could not read ${block} out of en.ts`);
  return [...body.matchAll(/^\s{4}([a-z_0-9]+):/gm)].map((m) => m[1]!);
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
