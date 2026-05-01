import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import resolvePlugin from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { rollup } from "rollup";
import { expect, test } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, "..");
const ZOD_SRC = resolve(PKG_ROOT, "../zod/src");

const ENTRIES = ["zod-full.ts", "zod-string.ts", "zod-mini-full.ts"];

async function circularWarningsFor(entry: string): Promise<string[]> {
  const warnings: string[] = [];
  const zodSrc = ZOD_SRC.replace(/\\/g, "/");
  await rollup({
    input: resolve(PKG_ROOT, entry),
    plugins: [
      resolvePlugin({ exportConditions: ["@zod/source", "default"] }),
      commonjs(),
      typescript({ tsconfig: false }),
    ],
    onwarn(warning) {
      if (warning.code !== "CIRCULAR_DEPENDENCY") return;
      const ids = (warning.ids ?? []).map((id) => id.replace(/\\/g, "/"));
      if (ids.some((id) => id.includes(zodSrc))) warnings.push(ids.join(" -> "));
    },
  });
  return warnings;
}

test.concurrent.each(ENTRIES)(
  "rollup reports no circular deps in zod source for %s (regression: #5275)",
  async (entry) => {
    const warnings = await circularWarningsFor(entry);
    expect(warnings).toEqual([]);
  }
);
