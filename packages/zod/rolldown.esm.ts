// rolldown.config.ts
import { defineConfig } from "rolldown";

export default defineConfig({
  // 1. point at your entry modules (could be a glob or single file)
  input: ["v3/index.ts", "v4/index.ts", "v4/mini/index.ts"],

  // 2. tell Rolldown to emit one .js file per module, preserving your src tree
  output: {
    dir: ".",
    format: "esm", // TS “module”: "esnext" → ESM
    preserveModules: true, // no bundling; one output per input
    preserveModulesRoot: "src",
    // use .mts for all emitted files
    entryFileNames: "[name].mts",
    chunkFileNames: "[name].mts",
  },

  // 3. have it pick up your tsconfig base + customConditions
  // tsconfigFilename: "./tsconfig.json", // will extend your base config
  resolve: {
    tsconfigFilename: "./tsconfig.json", // will extend your base config
    // conditions: ["@zod/source"], // customConditions ↔ resolve.conditions :contentReference[oaicite:1]{index=1}
  },
});
