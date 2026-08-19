import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import path from "node:path";
for (const f of ["zod-mini-boolean", "zod-mini-string", "zod-mini-object"]) {
  const r = await build({ entryPoints: [path.join("packages/treeshake", `${f}.ts`)], bundle: true, minify: true, format: "esm", write: false, logLevel: "silent" });
  const n = gzipSync(Buffer.from(r.outputFiles[0].contents), { level: 9 }).length;
  console.log(`${f.padEnd(20)} measured=${n}  ceiling(+28)=${n + 28}`);
}
