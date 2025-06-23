import { execaSync } from "execa";
import { globby } from "globby";
import { defineConfig } from "tsdown";
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

// const pkgJsonPath = "./package.json";
// const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
export default defineConfig({
  // exports: true,
  entry: entryPoints,
  outDir: ".",
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "./tsconfig.cjs.json",
  unbundle: true,
  // exports:"named",
  // outputOptions: {
  //   exports: "named",
  // },
  hooks: {
    async "build:prepare"() {
      await $`pnpm clean`;
    },
    // "build:before"(ctx) {
    //   const fmt = ctx.buildOptions.output!.format;
    //   const modPkg = { ...pkgJson };
    //   if (fmt === "cjs") {
    //     modPkg.type = "commonjs";
    //   } else {
    //     modPkg.type = "module";
    //   }
    //   delete modPkg.type;
    //   fs.writeFileSync(pkgJsonPath, JSON.stringify(modPkg, null, 2));
    // },
    // "build:done"() {
    //   fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    // },
  },
  attw: true,
  clean: false,
  outExtensions(ctx) {
    if (ctx.format === "cjs") return { js: ".cjs" };
    if (ctx.format === "es") return { js: ".js" };
    return undefined;
  },
});
