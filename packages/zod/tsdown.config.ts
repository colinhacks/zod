import { defineConfig } from "tsdown";

import { globby } from "globby";
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
  entry: entryPoints,
  outDir: ".",
  format: ["esm", "cjs"],
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
