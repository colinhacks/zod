import * as path from "node:path";
// esbuild.config.mjs
import { type Plugin, build } from "esbuild";
import { execaSync } from "execa";
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

const jsToTsPlugin: Plugin = {
  name: "js-to-ts",
  setup(build) {
    // catch any import that ends with “.js”
    build.onResolve({ filter: /\.js$/ }, (args) => {
      let tsPath = args.path.replace(/\.js$/, ".ts");
      if (!path.isAbsolute(tsPath)) {
        // if not already absolute, make it absolute relative to the importer
        tsPath = path.join(args.resolveDir, tsPath);
      }

      return {
        // rewrite it to “.ts”

        path: tsPath,
        // keep esbuild looking in the same namespace
        namespace: args.namespace,
      };
    });
  },
};

async function getReachable(entryPoints: string[]) {
  const result = await build({
    entryPoints,
    bundle: true,
    format: "esm",
    splitting: false, // we only need dependency graph
    metafile: true,
    loader: { ".ts": "ts", ".js": "ts" },
    write: false, // don’t emit files yet
    outdir: ".",
    plugins: [jsToTsPlugin],
  });
  // Collect all TS/JS inputs from the metafile
  return Object.keys(result.metafile.inputs).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
}

console.dir("ENTRY", { depth: null });
console.dir(entryPoints, { depth: null });
console.dir("REACHABLE", { depth: null });
const reachable = await getReachable(entryPoints);
console.dir(reachable, { depth: null });
// process.exit();
// console.dir(entryPoints, { depth: null });
// process.exit();

// build ESM
console.log("building ESM...");
await build({
  entryPoints: reachable,
  outdir: ".",
  format: "esm",
  bundle: false,
  outExtension: { ".js": ".mjs" },
  write: true,
  metafile: true,
});
// console.dir(
//   esmResults.outputFiles.map((x) => x.path),
//   { depth: null }
// );

// build CJS
console.log("building CJS...");
await build({
  entryPoints: reachable,
  outdir: ".",
  format: "cjs",
  bundle: false,
  write: true,
  metafile: true,
});
// console.dir(
//   cjsResults.outputFiles.map((x) => x.path),
//   { depth: null }
// );

// build types
console.log("building .d.ts declarations...");
const $ = execaSync({ stdio: "inherit" });
$`pnpm tsc -p tsconfig.types.json`;
