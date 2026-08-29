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

// Read jsr.json version
const jsrJsonPath = join(zodPackagePath, "jsr.json");
const jsrJson = JSON.parse(readFileSync(jsrJsonPath, "utf8"));
const jsrJsonVersion = jsrJson.version as string;
if (typeof jsrJsonVersion !== "string") {
  throw new Error("jsr.json version is not a string");
}

// read tag
const tag = process.env.npm_config_tag || "latest";
if (tag === "latest") {
  // e.g. "beta"
  const xyz = /^\d+\.\d+\.\d+$/;
  if (!xyz.test(packageJsonVersion)) {
    throw new Error("package.json version is not in x.y.z format");
  }
  if (!xyz.test(jsrJsonVersion)) {
    throw new Error("jsr.json version is not in x.y.z format");
  }
}

// Get version from versions.ts
const versionsVersion = `${version.major}.${version.minor}.${version.patch}`;

// Compare  versions
const isPackageJsonValid =
  tag === "latest" ? packageJsonVersion === versionsVersion : packageJsonVersion.startsWith(versionsVersion);
const isJsrJsonValid =
  tag === "latest" ? jsrJsonVersion === versionsVersion : jsrJsonVersion.startsWith(versionsVersion);
if (!isPackageJsonValid || !isJsrJsonValid) {
  console.error(`❌ Version mismatch:`);
  console.error(`   package.json: ${packageJsonVersion}`);
  console.error(`   jsr.json:    ${jsrJsonVersion}`);
  console.error(`   versions.ts:  ${versionsVersion}`);
  console.error(`   tag:          ${tag}`);
  console.error(`   isPackageJsonValid: ${isPackageJsonValid}`);
  console.error(`   isJsrJsonValid: ${isJsrJsonValid}`);
  process.exit(1);
} else {
  if (tag === "latest") {
    console.log(`✅ Versions match: ${packageJsonVersion} === ${versionsVersion}`);
  } else {
    console.log(`✅ Versions match: ${packageJsonVersion} starts with ${versionsVersion}`);
  }
}

// @zod/mini ships in lockstep with zod and its peer floor is the minor it shipped with; only latest releases are checked, since a caret floor is unsatisfiable by a prerelease and zod's own prereleases must not be blocked by a stale mini
if (tag !== "latest") {
  if (process.env.npm_package_name === "@zod/mini") {
    console.error(`❌ @zod/mini is not published on prerelease tags (tag: ${tag})`);
    process.exit(1);
  }
} else {
  const miniPackageJson = JSON.parse(readFileSync(join(__dirname, "..", "packages", "mini", "package.json"), "utf8"));
  const miniJsrJson = JSON.parse(readFileSync(join(__dirname, "..", "packages", "mini", "jsr.json"), "utf8"));
  const miniVersion = miniPackageJson.version as string;
  const miniJsrVersion = miniJsrJson.version as string;
  const miniPeer = miniPackageJson.peerDependencies?.zod as string | undefined;
  const miniJsrImport = miniJsrJson.imports?.["zod/mini"] as string | undefined;
  const expectedMiniPeer = `^${version.major}.${version.minor}.0`;
  const expectedMiniJsrImport = `jsr:@zod/zod@${expectedMiniPeer}/mini`;
  if (
    miniVersion !== versionsVersion ||
    miniJsrVersion !== versionsVersion ||
    miniPeer !== expectedMiniPeer ||
    miniJsrImport !== expectedMiniJsrImport
  ) {
    console.error(`❌ @zod/mini version mismatch:`);
    console.error(`   packages/mini/package.json version: ${miniVersion} (expected ${versionsVersion})`);
    console.error(`   packages/mini/jsr.json version: ${miniJsrVersion} (expected ${versionsVersion})`);
    console.error(`   packages/mini/package.json peerDependencies.zod: ${miniPeer} (expected ${expectedMiniPeer})`);
    console.error(
      `   packages/mini/jsr.json imports["zod/mini"]: ${miniJsrImport} (expected ${expectedMiniJsrImport})`
    );
    process.exit(1);
  }
  console.log(`✅ @zod/mini ${miniVersion} with peer zod@${miniPeer} (npm + jsr)`);
}
