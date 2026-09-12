import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { expect, test } from "vitest";

// These declarations are unreachable from a minimal schema, but esbuild only drops them because of details that read as noise: `@__PURE__` annotations, and the `anchor()` helper in regexes.ts that exists solely because esbuild will not drop an annotated call whose argument interpolates a variable. Inlining the helper or deleting an annotation silently puts them back with no other test going red.
//
// Rollup drops all of these regardless, so a rollup fixture would report no difference and prove nothing. This has to run under esbuild.

const here = path.dirname(fileURLToPath(import.meta.url));
const MINI = path.resolve(here, "../../../mini/index.ts");
const CLASSIC = path.resolve(here, "../../../index.ts");

async function bundle(entrypoint: string, source: string): Promise<string> {
  const result = await build({
    stdin: {
      contents: source.replace("%ENTRY%", entrypoint),
      loader: "ts",
      resolveDir: here,
    },
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2020",
    treeShaking: true,
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0]!.text;
}

test("a minimal zod/mini schema drops the declarations it cannot reach", async () => {
  const out = await bundle(MINI, `import * as z from "%ENTRY%";\nconsole.log(z.boolean().parse(true));`);

  // Sanity check: the schema itself is present, so an empty bundle cannot pass this test.
  expect(out).toContain("boolean");

  expect(out, "core.ts `$brand` lost its @__PURE__ annotation").not.toContain("zod_brand");
  expect(out, "util.ts `NUMBER_FORMAT_RANGES` escaped its @__PURE__ IIFE").not.toContain("MAX_SAFE_INTEGER");
  expect(out, "regexes.ts `date` is pinned again — was `anchor()` inlined?").not.toContain("02-29");
}, 30000);

// `registries.ts` is dropped from the mini module graph entirely, so its two symbols are absent there before and after. Classic is the entrypoint that exercises them.
test("a minimal classic schema drops the registry symbols", async () => {
  const out = await bundle(CLASSIC, `import * as z from "%ENTRY%";\nconsole.log(z.boolean().parse(true));`);

  expect(out).toContain("boolean");

  expect(out, "registries.ts `$output` lost its @__PURE__ annotation").not.toContain("ZodOutput");
  expect(out, "registries.ts `$input` lost its @__PURE__ annotation").not.toContain("ZodInput");
}, 30000);
