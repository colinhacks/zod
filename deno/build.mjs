// This script expects to be run via `yarn build:deno`.
//
// Although this script generates code for use in Deno, this script itself is
// written for Node so that contributors do not need to install Deno to build.
//
// @ts-check

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname } from "path";

// Node's path.join() normalize explicitly-relative paths like "./index.ts" to
// paths like "index.ts" which don't work as relative ES imports, so we do this.
const join = (/** @type string[] */ ...parts) =>
  parts.join("/").replace(/\/\//g, "/");

const projectRoot = process.cwd();
const nodeSrcRoot = join(projectRoot, "src");
const denoLibRoot = join(projectRoot, "deno", "lib");

const skipList = [
  join(nodeSrcRoot, "__tests__", "object-in-es5-env.test.ts"),
  join(nodeSrcRoot, "__tests__", "languageServerFeatures.test.ts"),
  join(nodeSrcRoot, "__tests__", "languageServerFeatures.source.ts"),
];
const walkAndBuild = (/** @type string */ dir) => {
  for (const entry of readdirSync(join(nodeSrcRoot, dir), {
    withFileTypes: true,
    encoding: "utf-8",
  })) {
    if (entry.isDirectory()) {
      walkAndBuild(join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const nodePath = join(nodeSrcRoot, dir, entry.name);
      const denoPath = join(denoLibRoot, dir, entry.name);

      if (skipList.includes(nodePath)) {
        // console.log(`Skipping ${nodePath}`);
        continue;
      }

      const nodeSource = readFileSync(nodePath, { encoding: "utf-8" });

      const denoSource = nodeSource.replace(
        /^(?:import|export)[\s\S]*?from\s*['"]([^'"]*)['"];$/gm,
        (line, target) => {
          if (target === "@jest/globals") {
            return `import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";\nconst test = Deno.test;`;
          }

          const targetNodePath = join(dirname(nodePath), target);
          const targetNodePathIfFile = targetNodePath + ".ts";
          const targetNodePathIfDir = join(targetNodePath, "index.ts");

          try {
            if (statSync(targetNodePathIfFile)?.isFile()) {
              return line.replace(target, target + ".ts");
            }
          } catch (error) {
            if (error?.code !== "ENOENT") {
              throw error;
            }
          }

          try {
            if (statSync(targetNodePathIfDir)?.isFile()) {
              return line.replace(target, join(target, "index.ts"));
            }
          } catch (error) {
            if (error?.code !== "ENOENT") {
              throw error;
            }
          }

          // console.warn(`Skipping non-resolvable import:\n  ${line}`);
          return line;
        }
      );

      mkdirSync(dirname(denoPath), { recursive: true });
      writeFileSync(denoPath, denoSource, { encoding: "utf-8" });
    }
  }
};

walkAndBuild("");

writeFileSync(join(denoLibRoot, "mod.ts"), `export * from "./index.ts";\n`, {
  encoding: "utf-8",
});
