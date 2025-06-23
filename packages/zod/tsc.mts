// import * as fs from "node:fs";
// import * as path from "node:path";
import * as fs from "node:fs";
import * as path from "node:path";
import { execaSync } from "execa";
// import { globbySync } from "globby";

const $ = execaSync({ stdio: "inherit" });

$`rm -rf ./dist`;

const initPkgJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

function writePackageJson(dir: string, fields: Record<string, any>) {
  const packageJsonPath = path.join(path.resolve(dir), "package.json");
  fs.mkdirSync(dir, {
    recursive: true,
  });
  console.log(`writing package.json to ${packageJsonPath}...`);
  fs.writeFileSync(packageJsonPath, JSON.stringify(fields, null, 2));
  return packageJsonPath;
}

console.log("building ESM...");
const esmPkg = writePackageJson(".", { ...initPkgJson, type: "module" });
$`pnpm tsc -p tsconfig.esm.json`;
fs.rmSync(esmPkg, { force: true });

// const esmDistDir = path.resolve("./dist/esm");
// const esmPackageJsonPath = path.join(esmDistDir, "package.json");
// fs.mkdirSync(esmDistDir, { recursive: true });
// fs.writeFileSync(esmPackageJsonPath, JSON.stringify({ type: "module" }, null, 2));
// writePackageJson("./dist/esm", { type: "module" });

console.log("building CJS...");
const cjsPkg = writePackageJson(".", { ...initPkgJson, type: "commonjs" });
$`pnpm tsc -p tsconfig.cjs.json`;
fs.rmSync(cjsPkg, { force: true });
// const cjsPath = "./dist/cjs";
// const cjsDistDir = path.resolve(cjsPath);
// const cjsPackageJsonPath = path.join(path.resolve(cjsPath), "package.json");
// fs.mkdirSync(cjsDistDir, { recursive: true });
// fs.writeFileSync(cjsPackageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
// writePackageJson("./dist/cjs", { type: "commonjs" });
const typesPkg = writePackageJson(".", { ...initPkgJson, type: "commonjs" });
console.log("building types...");
$`pnpm tsc -p tsconfig.types.json`;
fs.rmSync(typesPkg, { force: true });
// const typesPath = "./dist/types";
// const typesDistDir = path.resolve(typesPath);
// const typesPackageJsonPath = path.join(path.resolve(typesPath), "package.json");
// fs.mkdirSync(typesDistDir, { recursive: true });
// fs.writeFileSync(typesPackageJsonPath, JSON.stringify({ type: "module" }, null, 2));
// writePackageJson("./dist/types", { type: "commonjs" });

// return to initial
writePackageJson(".", initPkgJson);

console.log("DONE.");
