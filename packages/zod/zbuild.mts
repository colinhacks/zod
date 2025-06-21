// esbuild.config.mjs
import { build } from "esbuild";
import { execaSync } from "execa";
import { globby } from "globby";

const entryPoints = await globby(["index.ts", "v3/**/*.ts", "v4/**/*.ts", "v4-mini/**/*.ts"], {
  gitignore: true,
  ignore: ["**/tests/**", "**/benchmarks/**"],
});
console.dir(entryPoints, { depth: null });

// build ESM
await build({
  entryPoints,

  outdir: "dist",
  format: "esm",
  bundle: false,
  loader: { ".ts": "ts" },
  outExtension: { ".js": ".mjs" },
});

// build CJS
await build({
  entryPoints,
  outdir: "dist",
  format: "cjs",
  bundle: false,
  loader: { ".ts": "ts" },
});

// build types
const $ = execaSync({ stdio: "inherit" });
$`pnpm tsc -p tsconfig.types.json`;
