import { defineConfig } from "tsdown";
import { glob } from "tinyglobby";

const locales = await glob("./src/v4/locales/*.ts", {
  cwd: import.meta.dirname,
});

// Necessary due to https://github.com/rolldown/tsdown/issues/341 for now
const localesObject = Object.fromEntries(
  locales.map((filename) => {
    const localeName = filename.split("/").pop()?.replace(/\.ts$/, "");
    return [`v4/locales/${localeName}`, `./src/v4/locales/${localeName}.ts`];
  })
);

export default defineConfig({
  entry: {
    ".": "./src/index.ts",
    v3: "./src/v3/index.ts",
    v4: "./src/v4/index.ts",
    "v4/core": "./src/v4/core/index.ts",
    "v4/locales": "./src/v4/locales/index.ts",
    "v4-mini": "./src/v4/mini/index.ts",
    ...localesObject,
  },
  platform: "neutral",
  outputOptions: {
    preserveModules: true, // no bundling; one output per input
    preserveModulesRoot: "src",
    // use .mts for all emitted files
    entryFileNames: "[name].mts",
    chunkFileNames: "[name].mts",
  },
  unbundle: true,
  // Might need https://github.com/rolldown/tsdown/issues/339 to consider
  exports: true,
  dts: true,
});
