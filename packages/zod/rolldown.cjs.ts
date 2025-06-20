// rolldown.config.ts
import { defineConfig } from "rolldown";

export default defineConfig({
  // 1. point at your entry modules (could be a glob or single file)
  input: ["./v3/index.ts", "./v4/index.ts", "./v4/core/index.ts", "./v4/mini/index.ts", "./v4/classic/index.ts"],

  // 2.  transpile, no bundling
  output: {
    dir: "dist",
    format: "cjs",
    preserveModules: true,
    preserveModulesRoot: ".",
    entryFileNames: "[name].mjs",
    chunkFileNames: "[name].mjs",
  },

  resolve: {
    tsconfigFilename: "./tsconfig.json",
  },
});
