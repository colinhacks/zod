import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";
import { expect, test } from "vitest";
import * as core from "zod/v4/core";

// Browser polyfills for node globals land as raw text in the bundle's top scope — an esbuild `banner`, a scope-unaware injector — so the bundler never sees the collision and the browser is the first thing to read both declarations. zod must therefore declare none of these names at module scope. The JSON Schema pass shipped an `export function process` for three minors before #6397 reported the white screen it caused.
const INJECTED = ["process", "Buffer", "global", "__dirname", "__filename"];

const here = path.dirname(fileURLToPath(import.meta.url));
const CLASSIC = path.resolve(here, "../../../index.ts");
const MINI = path.resolve(here, "../../../mini/index.ts");

const polyfills = INJECTED.map((name) => `const ${name} = {};`).join("\n");

// toJSONSchema has to be reachable: a bundle that only parses a schema tree-shakes the offending module away and would pass no matter what it declares. `z.core.process` is the pre-rename export name, read as a namespace property so the entry itself declares no `process` binding.
const ENTRY = `import * as z from "%ENTRY%";\nglobalThis.__out = [z.toJSONSchema(z.string()), z.core.process];`;

test.each([
  ["classic", CLASSIC],
  ["mini", MINI],
])(
  "a %s bundle reaching toJSONSchema parses beside polyfilled node globals",
  async (_flavor, entrypoint) => {
    const result = await build({
      stdin: { contents: ENTRY.replace("%ENTRY%", entrypoint), loader: "ts", resolveDir: here },
      bundle: true,
      format: "esm",
      target: "es2020",
      write: false,
      logLevel: "silent",
      banner: { js: polyfills },
    });
    const out = result.outputFiles[0]!.text;

    expect(out).toContain("https://json-schema.org/draft/2020-12/schema");

    // the banner is appended after esbuild has already renamed its own symbols, so this second pass is where a duplicate surfaces: `The symbol "process" has already been declared`
    await expect(transform(out, { loader: "js", format: "esm" })).resolves.toBeTruthy();
  },
  30000
);

test("the pre-rename `process` export still resolves to the helper", () => {
  expect(core.process).toBe(core.processSchema);
});
