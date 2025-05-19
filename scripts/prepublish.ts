import { readFileSync } from "node:fs";

// read package.json for zod and @zod/mini
const zodPackageJson = JSON.parse(readFileSync("packages/zod/package.json", "utf-8"));
const zodMiniPackageJson = JSON.parse(readFileSync("packages/mini/package.json", "utf-8"));

// check that versions are the same
if (zodPackageJson.version !== zodMiniPackageJson.version) {
  throw new Error(
    `zod and @zod/mini versions do not match: ${zodPackageJson.version} !== ${zodMiniPackageJson.version}`
  );
}
