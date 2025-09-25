import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { version } from "../packages/zod/src/v4/core/versions.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Get zod package path
const zodPackagePath = join(__dirname, "..", "packages", "zod");

// Read package.json version
const packageJsonPath = join(zodPackagePath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageJsonVersion = packageJson.version as string;
if (typeof packageJsonVersion !== "string") {
  throw new Error("package.json version is not a string");
}

// read tag
const tag = process.env.npm_config_tag || "latest";

// Get version from versions.ts
const versionsVersion = `${version.major}.${version.minor}.${version.patch}`;

// Compare  versions
const isPackageJsonValid =
  tag === "latest" ? packageJsonVersion === versionsVersion : packageJsonVersion.startsWith(versionsVersion);
if (!isPackageJsonValid) {
  console.error(`❌ Version mismatch:`);
  console.error(`   package.json: ${packageJsonVersion}`);
  console.error(`   versions.ts:  ${versionsVersion}`);
  console.error(`   tag:          ${tag}`);
  console.error(`   isPackageJsonValid: ${isPackageJsonValid}`);
  process.exit(1);
} else {
  if (tag === "latest") {
    console.log(`✅ Versions match: ${packageJsonVersion} === ${versionsVersion}`);
  } else {
    console.log(`✅ Versions match: ${packageJsonVersion} starts with ${versionsVersion}`);
  }
}
