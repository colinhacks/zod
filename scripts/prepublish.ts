import { readFileSync } from "node:fs";

// read package.json for zod and zod-core
const zodPackageJson = JSON.parse(
  readFileSync("packages/zod/package.json", "utf-8")
);
const zodCorePackageJson = JSON.parse(
  readFileSync("packages/zod-core/package.json", "utf-8")
);

// check that versions are the same
if (zodPackageJson.version !== zodCorePackageJson.version) {
  throw new Error(
    `zod and zod-core versions do not match: ${zodPackageJson.version} !== ${zodCorePackageJson.version}`
  );
}

console.log("PUBLISH");
