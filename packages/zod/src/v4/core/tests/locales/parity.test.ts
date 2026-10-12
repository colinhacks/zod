import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { z } from "../../../../index.js";

// Every locale must carry an entry for each key `en` translates. Four keys have drifted this way already — `credit_card` (#5931), `mac` (#5440), `Sizable.map` (#5316) and Hebrew's `uuidv4`/`uuidv6`/`template_literal` — each shipped in `en` and left the rest behind, so the gap only surfaced as a raw key in a user's error message.
//
// The key lists are read out of `en.ts` rather than hardcoded, so adding a format to `en` extends this test automatically. That is the whole point: a hand-maintained list here would miss the next one exactly the way the last four were missed.

const localesDir = fileURLToPath(new URL("../../../locales/", import.meta.url));
const sources = Object.fromEntries(readdirSync(localesDir).map((f) => [f, readFileSync(localesDir + f, "utf8")]));

function keysOf(source: string, block: string): string[] {
  const body = source.match(new RegExp(`const ${block}[^=]*= \\{([\\s\\S]*?)\\n  \\};`))?.[1];
  if (!body) throw new Error(`could not read ${block}`);
  return [...body.matchAll(/^\s{4}([a-z_0-9]+):/gm)].map((m) => m[1]!);
}

const locales = z.locales as unknown as Record<string, () => { localeError: z.core.$ZodErrorMap }>;
const names = Object.keys(locales).filter((k) => typeof locales[k] === "function");
const SENTINEL = "zzsentinelzz";

/** True when the locale has no entry for `format`: the message is what the sentinel produces. */
function fallsThrough(locale: string, format: string): boolean {
  const map = locales[locale]!().localeError as (iss: unknown) => string | undefined;
  const build = (k: string) => ({ code: "invalid_format", format: k, input: "x", path: [] });
  const real = String(map(build(format)) ?? "");
  const sentinel = String(map(build(SENTINEL)) ?? "");
  return real === sentinel.split(SENTINEL).join(format);
}

test("every locale translates each FormatDictionary key that en translates", () => {
  // A key `en` maps to its own name (emoji, nanoid, cuid, cuid2) renders identically whether or not a locale defines it, so omitting it is not drift.
  const required = keysOf(sources["en.ts"]!, "FormatDictionary").filter((k) => !fallsThrough("en", k));
  const gaps = required.flatMap((k) => names.filter((n) => fallsThrough(n, k)).map((n) => `${n}.${k}`));

  expect(gaps).toEqual([]);
});

// read from source: a size fallback names the origin in the locale's own words ("mapa", "valeur"), which no sentinel can stand in for
test("every locale sizes each origin en sizes", () => {
  const required = keysOf(sources["en.ts"]!, "Sizable");
  const gaps = Object.entries(sources)
    .filter(([, source]) => source.includes("const Sizable"))
    .flatMap(([file, source]) => {
      const keys = keysOf(source, "Sizable");
      return required.filter((k) => !keys.includes(k)).map((k) => `${file.slice(0, -3)}.${k}`);
    });

  expect(gaps).toEqual([]);
});
