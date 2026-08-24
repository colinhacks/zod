import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import resolve from "@rollup/plugin-node-resolve";
import { type Plugin, rollup } from "rollup";
import { beforeAll, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Unlike the rest of the suite, this file bundles the BUILT package: `resolve()` knows
// nothing about vitest's `@zod/source` condition, so `zod` resolves through `exports` to
// `packages/zod/index.js`. That is the faithful thing to measure — it is what consumers
// actually bundle — but it means the assertions are stale until you `pnpm build`. CI is
// fine, since `pnpm build` precedes `pnpm test`.
const BUILT_ENTRY = path.join(__dirname, "node_modules", "zod", "index.js");

// Strings unique to a single locale. Grepping the bundle for them proves inclusion
// rather than inferring it from byte counts.
const GERMAN = "Zu klein: erwartet";
const JAPANESE = "小さすぎる値";

// `import z from "zod"` used to pull all 53 locale modules into the bundle, because
// `export default z` made the default export a fresh namespace value rather than a
// re-export of the `z` binding — see #6050. Rollup and Webpack share that blind spot and
// were fixed by the same one-line change, so guarding Rollup guards both; esbuild cannot
// shake a re-exported namespace at all (evanw/esbuild#1420) and is out of scope here.
//
// Both specifiers are covered because they were fixed in separate files — a regression in
// `src/v4/index.ts` alone would otherwise go unnoticed. `zod/mini` and `zod/v4-mini` are
// deliberately absent: they have no default export, so Rollup errors on `import z from`.
const SPECIFIERS = ["zod", "zod/v4"];

function entry(code: string): Plugin {
  const id = path.join(__dirname, "__entry__.mjs");
  return {
    name: "entry",
    resolveId: (source) => (source === id ? id : null),
    load: (loaded) => (loaded === id ? code : null),
    options: (opts) => ({ ...opts, input: id }),
  };
}

async function bundle(code: string): Promise<string> {
  const build = await rollup({
    input: "ignored",
    plugins: [entry(code), resolve()],
    treeshake: { preset: "smallest", annotations: true },
    onwarn: () => {},
  });
  const { output } = await build.generate({ format: "esm" });
  await build.close();
  return output.map((chunk) => (chunk.type === "chunk" ? chunk.code : "")).join("");
}

describe("locale tree-shaking", () => {
  beforeAll(() => {
    if (!existsSync(BUILT_ENTRY)) throw new Error(`zod is not built — run \`pnpm build\` first (${BUILT_ENTRY})`);
  });

  for (const spec of SPECIFIERS) {
    it(`drops unused locales from a default import of ${spec}`, async () => {
      const code = await bundle(`import z from "${spec}";\nconsole.log(z.string().min(5).safeParse("hi"));`);
      expect(code).not.toContain(GERMAN);
      expect(code).not.toContain(JAPANESE);
    });

    it(`drops unused locales from a named import of ${spec}`, async () => {
      const code = await bundle(`import { z } from "${spec}";\nconsole.log(z.string().min(5).safeParse("hi"));`);
      expect(code).not.toContain(GERMAN);
      expect(code).not.toContain(JAPANESE);
    });

    it(`keeps the one locale used via ${spec}, and only that one`, async () => {
      const code = await bundle(
        `import z from "${spec}";\nz.config(z.locales.de());\nconsole.log(z.string().min(5).safeParse("hi"));`
      );
      expect(code).toContain(GERMAN);
      expect(code).not.toContain(JAPANESE);
    });
  }
});
