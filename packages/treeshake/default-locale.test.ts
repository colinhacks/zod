import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import resolve from "@rollup/plugin-node-resolve";
import { type Plugin, rollup } from "rollup";
import { afterAll, beforeAll, expect, test } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built package is what carries the `sideEffects: false` stub package.json
// files, so these bundle against `packages/zod`'s output rather than src. A bare
// `config(en())` at module scope in `classic/external.ts` is dropped by every
// bundler that honors the flag, which silently degraded every message to
// "Invalid input" from 4.4.1 onward — see #5953, #5725, #4891.
//
// Bundling build output is the only way to cover the shipped layout, but it means
// a missing or stale build would otherwise answer with an opaque ENOENT or — worse
// for a regression guard — a confident false green. Hence the freshness check.

const zodRoot = path.resolve(__dirname, "../zod");
const builtEntry = path.join(zodRoot, "v4/index.js");

function newestMtime(dir: string): number {
  let newest = 0;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    newest = Math.max(newest, item.isDirectory() ? newestMtime(full) : statSync(full).mtimeMs);
  }
  return newest;
}

beforeAll(() => {
  if (!existsSync(builtEntry)) throw new Error(`${builtEntry} is missing. Run \`pnpm build\` first.`);
  if (newestMtime(path.join(zodRoot, "src")) > statSync(builtEntry).mtimeMs) {
    throw new Error(`${builtEntry} is older than packages/zod/src. Run \`pnpm build\` first.`);
  }
});

const tmp = mkdtempSync(path.join(tmpdir(), "zod-treeshake-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

function entry(code: string): Plugin {
  const id = path.join(__dirname, "__default_locale_entry__.mjs");
  return {
    name: "entry",
    resolveId: (source) => (source === id ? id : null),
    load: (loaded) => (loaded === id ? code : null),
    options: (opts) => ({ ...opts, input: id }),
  };
}

async function bundleAndRun(code: string): Promise<Record<string, string>> {
  const build = await rollup({
    input: "ignored",
    plugins: [entry(code), resolve()],
    treeshake: { preset: "smallest", annotations: true },
    onwarn: () => {},
  });
  const { output } = await build.generate({ format: "esm" });
  await build.close();
  const file = path.join(tmp, `${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(file, output.map((chunk) => (chunk.type === "chunk" ? chunk.code : "")).join(""));
  return import(pathToFileURL(file).href);
}

test("a tree-shaken bundle keeps the default English locale", async () => {
  const { message } = await bundleAndRun(
    `import * as z from "zod/v4";
     export const message = z.enum(["km", "mi"]).safeParse("feet").error.issues[0].message;`
  );
  expect(message).toBe('Invalid option: expected one of "km"|"mi"');
});

test("an explicitly configured locale still wins in a tree-shaken bundle", async () => {
  const { message } = await bundleAndRun(
    `import * as z from "zod/v4";
     z.config(z.locales.fr());
     export const message = z.enum(["km", "mi"]).safeParse("feet").error.issues[0].message;`
  );
  expect(message).toBe('Option invalide : une valeur parmi "km"|"mi" attendue');
});
