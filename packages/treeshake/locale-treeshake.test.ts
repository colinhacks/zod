import path from "node:path";
import { fileURLToPath } from "node:url";
import resolve from "@rollup/plugin-node-resolve";
import { type Plugin, rollup } from "rollup";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Strings unique to a single locale. Grepping the bundle for them proves inclusion
// rather than inferring it from byte counts.
const GERMAN = "Zu klein: erwartet";
const JAPANESE = "小さすぎる値";

// `import z from "zod"` used to pull all 53 locale modules into the bundle, because
// `export default z` made the default export a fresh namespace value rather than a
// re-export of the `z` binding — see #6050.
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
  it("drops unused locales from a default import", async () => {
    const code = await bundle(`import z from "zod";\nconsole.log(z.string().min(5).safeParse("hi"));`);
    expect(code).not.toContain(GERMAN);
    expect(code).not.toContain(JAPANESE);
  });

  it("drops unused locales from a named import", async () => {
    const code = await bundle(`import { z } from "zod";\nconsole.log(z.string().min(5).safeParse("hi"));`);
    expect(code).not.toContain(GERMAN);
    expect(code).not.toContain(JAPANESE);
  });

  it("keeps the one locale that is used, and only that one", async () => {
    const code = await bundle(
      `import z from "zod";\nz.config(z.locales.de());\nconsole.log(z.string().min(5).safeParse("hi"));`
    );
    expect(code).toContain(GERMAN);
    expect(code).not.toContain(JAPANESE);
  });
});
