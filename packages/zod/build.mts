// import * as fs from "node:fs";
// import * as path from "node:path";
import * as fs from "node:fs";
import * as path from "node:path";
import { execaSync } from "execa";
// import { globbySync } from "globby";

const $ = execaSync({ stdio: "inherit" });

$`rm -rf ./dist`;

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
const esmPkg = writePackageJson("./src", { type: "module" });
$`pnpm tsc -p tsconfig.esm.json`;
fs.rmSync(esmPkg, { force: true });

// const esmDistDir = path.resolve("./dist/esm");
// const esmPackageJsonPath = path.join(esmDistDir, "package.json");
// fs.mkdirSync(esmDistDir, { recursive: true });
// fs.writeFileSync(esmPackageJsonPath, JSON.stringify({ type: "module" }, null, 2));
writePackageJson("./dist/esm", { type: "module" });

console.log("building CJS...");
const cjsPkg = writePackageJson("./src", { type: "commonjs" });
$`pnpm tsc -p tsconfig.cjs.json`;
fs.rmSync(cjsPkg, { force: true });
// const cjsPath = "./dist/cjs";
// const cjsDistDir = path.resolve(cjsPath);
// const cjsPackageJsonPath = path.join(path.resolve(cjsPath), "package.json");
// fs.mkdirSync(cjsDistDir, { recursive: true });
// fs.writeFileSync(cjsPackageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
writePackageJson("./dist/cjs", { type: "commonjs" });

console.log("building types...");
$`pnpm tsc -p tsconfig.types.json`;
// const typesPath = "./dist/types";
// const typesDistDir = path.resolve(typesPath);
// const typesPackageJsonPath = path.join(path.resolve(typesPath), "package.json");
// fs.mkdirSync(typesDistDir, { recursive: true });
// fs.writeFileSync(typesPackageJsonPath, JSON.stringify({ type: "module" }, null, 2));
writePackageJson("./dist/types", { type: "commonjs" });

console.log("DONE.");

// /**
//  * Synchronously builds TypeScript projects (ESM and CommonJS)
//  * and recursively renames all .js files in the dist directory to .mjs.
//  * Uses execa's $.sync for shell commands and globbySync for file finding.
//  * Pipes subprocess logs (stdout/stderr) to the main process.
//  */
// // Resolve the absolute path to the 'dist' directory
// const distDir = path.resolve("./dist");

// // Check if the 'dist' directory exists and remove it if it does
// // The 'recursive' and 'force' options ensure it works for non-empty directories
// // and doesn't throw an error if the directory doesn't exist.
// console.log("Cleaning up old dist directory..."); // Added log for clarity
// if (fs.existsSync(distDir)) {
//   // Use rmdirSync instead of rmSync for compatibility
//   fs.rmSync(distDir, { recursive: true });
//   console.log("Dist directory cleaned."); // Added log for clarity
// } else {
//   console.log("Dist directory does not exist, skipping clean-up."); // Added log for clarity
// }

// console.log("Compiling ES modules..."); // Added log for clarity
// // Compile ES modules using pnpm tsc with the specified tsconfig
// // $.sync executes the command synchronously and waits for it to complete.
// // stdio: 'inherit' pipes the subprocess's stdout and stderr to the main process's console.
// $`pnpm tsc -p tsconfig.esm.json`;
// console.log("ES modules compiled."); // Added log for clarity

// {
//   console.log("Renaming .js files to .mjs in dist directory..."); // Added log for clarity
//   const tsFiles = globbySync(`${distDir}/**/*.js`, {
//     onlyFiles: true,
//   });

//   // Iterate over each found .js file and rename it to .mjs
//   for (const file of tsFiles) {
//     if (file.endsWith(".mjs")) continue; // skip if already .mjs
//     // Create the new path by replacing the .js extension with .mjs
//     const newPath = file.replace(/\.js$/, ".mjs");
//     // Execute the 'mv' command synchronously to rename the file
//     // Using $.sync for this shell command as well, with stdio inherited.
//     fs.renameSync(file, newPath);
//   }
//   console.log("Files renamed to .mjs."); // Added log for clarity
// }
// console.log("Compiling CommonJS modules..."); // Added log for clarity
// // Compile CommonJS modules using pnpm tsc with the specified tsconfig
// // stdio: 'inherit' pipes the subprocess's stdout and stderr to the main process's console.
// $`pnpm tsc -p tsconfig.cjs.json`;
// console.log("CommonJS modules compiled."); // Added log for clarity

// console.log("Build process completed successfully!"); // Added log for clarity
// {
//   console.log("Renaming .js files to .mjs in dist directory..."); // Added log for clarity
//   const tsFiles = globbySync(`${distDir}/**/*.js`, {
//     onlyFiles: true,
//   });

//   // Iterate over each found .js file and rename it to .mjs
//   for (const file of tsFiles) {
//     if (file.endsWith(".cjs")) continue; // skip if already .mjs
//     // Create the new path by replacing the .js extension with .mjs
//     const newPath = file.replace(/\.js$/, ".cjs");
//     // Execute the 'mv' command synchronously to rename the file
//     // Using $.sync for this shell command as well, with stdio inherited.
//     fs.renameSync(file, newPath);
//   }
//   console.log("Files renamed to .cjs."); // Added log for clarity
// }
