import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { beforeAll, expect, test } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Like the other tests here, this bundles the BUILT package: esbuild is given no
// `@zod/source` condition, so `zod/mini` resolves through `exports` to what a
// consumer actually installs. That makes the numbers meaningful and the file
// stale until `pnpm build` has run — fine in CI, which builds first.
const BUILT_ENTRY = path.join(__dirname, "node_modules", "zod", "index.js");

/**
 * Ceilings exist because the bundle axis had no automated guard and two
 * module-scope initializer leaks landed within three commits — `urlCanParse` in
 * `core/schemas.ts` and `CONSTANT_CATCH` in `core/util.ts`. Both were a `const`
 * whose initializer is a *call*, which no bundler can prove side-effect free, so
 * both shipped into builds that could never reach the feature. Both passed the
 * whole suite, because nothing asserted a size.
 *
 * Headroom is ~28 bytes: under the 43 and ~40 those two leaks cost, so the class
 * this exists for still trips it, but not so tight that ordinary churn does. The
 * first cut used 16–21 and broke within a day — #6085 and #6426 each added ~20 to
 * every fixture, and together they crossed a ceiling neither would have alone.
 * That is a false positive, not a catch: it reports a number moving rather than
 * something reaching a bundle that cannot use it, which is what `MUST_NOT_APPEAR`
 * below names exactly and what this can only approximate.
 *
 * A legitimate increase means re-measuring and raising the number in the same
 * commit that causes it, which is the point: the number moves when someone
 * decides it should.
 *
 *   pnpm build && pnpm vitest run packages/treeshake/bundle-size.test.ts
 *
 * The failure message prints the measured size, so updating is mechanical.
 */
const CEILINGS: Record<string, number> = {
  // Raised from 2813 / 3285 / 4288 by the commit that caused it: threading a `callee` to `Error.captureStackTrace` from every throwing parse entry point costs +13 / +17 / +16, since a bundle that parses at all carries it. Measured 2808 / 3271 / 4301 here; 28 bytes of headroom each. The per-fixture notes below record what each ceiling already carried before this.
  "zod-mini-boolean": 2836,
  // Also carries the code-point string length scan: `.min`/`.max`/`.length` on a string pulls in the surrogate walk.
  "zod-mini-string": 3299,
  // Also carries the construction-time discriminator check, which writes a WeakMap entry from `$ZodObject`, so every bundle containing `z.object` pays for it whether or not it builds a discriminated union.
  "zod-mini-object": 4329,
};

/**
 * Identifiers that must not appear in a bundle that never uses the feature they
 * belong to. A byte ceiling drifts with unrelated churn; this does not, and it
 * names the exact regression rather than its symptom.
 */
const MUST_NOT_APPEAR = ["canParse", "constantCatch"];

beforeAll(() => {
  if (!existsSync(BUILT_ENTRY)) {
    throw new Error(`${BUILT_ENTRY} is missing. Run \`pnpm build\` first.`);
  }
});

async function bundle(fixture: string): Promise<string> {
  const result = await build({
    entryPoints: [path.join(__dirname, `${fixture}.ts`)],
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    logLevel: "silent",
  });
  return Buffer.from(result.outputFiles[0]!.contents).toString("utf8");
}

for (const [fixture, ceiling] of Object.entries(CEILINGS)) {
  test(`${fixture} stays under ${ceiling} gzipped bytes`, async () => {
    const code = await bundle(fixture);
    const size = gzipSync(Buffer.from(code), { level: 9 }).length;
    expect(
      size,
      `${fixture} is ${size} gzipped bytes, over the ${ceiling} ceiling. If the growth is intended, raise the ceiling in this file in the same commit.`
    ).toBeLessThanOrEqual(ceiling);
  });
}

test("a mini bundle carries nothing from features it never uses", async () => {
  const code = await bundle("zod-mini-boolean");
  for (const identifier of MUST_NOT_APPEAR) {
    expect(code, `${identifier} reached a bundle that only uses z.boolean()`).not.toContain(identifier);
  }
});
