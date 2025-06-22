import { defineConfig } from "tsdown";

import { execaSync } from "execa";
import { globby } from "globby";
const $ = execaSync({ stdio: "inherit" });

const entryPoints = await globby(
  [
    "index.ts",
    "v3/index.ts",
    "v4/index.ts",
    "v4/classic/index.ts",
    "v4/mini/index.ts",
    "v4-mini/index.ts",
    "v4/core/index.ts",
    "v4/locales/*.ts",
  ],
  {
    ignore: ["**/*.d.ts"],
  }
);

export default defineConfig({
  // exports: true,
  entry: entryPoints,
  outDir: ".",
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "./tsconfig.types.json",
  unbundle: true,
  hooks: {
    async "build:prepare"() {
      await $`pnpm clean`;
    },
  },
  attw: true,
  clean: false,
  outExtensions(context) {
    if (context.format === "cjs") return { js: ".js" };
    if (context.format === "es") return { js: ".mjs" };
    return undefined;
  },
});
