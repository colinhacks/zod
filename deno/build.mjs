// This script expects to be run via `yarn build:deno`.
//
// Although this script generates code for use in Deno, this script itself is
// written for Node so that contributors do not need to install Deno to build.
//
// @ts-check

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const projectRoot = process.cwd();
const nodeSrcRoot = join(projectRoot, "src");
const denoLibRoot = join(projectRoot, "deno", "lib");

const walkAndBuild = (/** @type string */ dir) => {
  for (const entry of readdirSync(join(nodeSrcRoot, dir), {
    withFileTypes: true,
    encoding: "utf-8"
  })) {
    if (entry.isDirectory()) {
      walkAndBuild(join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const nodePath = join(nodeSrcRoot, dir, entry.name);
      const denoPath = join(denoLibRoot, dir, entry.name);

      const nodeSource = readFileSync(nodePath, {encoding: "utf-8"});

      const denoSource = nodeSource.replace(
        /^(?:import|export)[\s\S]*?from\s*['"]([^'"]*)['"];$/gm,
        (line, target) => {
          if (target === '@jest/globals') {
            return `import { expect } from 'https://deno.land/x/expect@v0.2.6/mod.ts';\nconst test = Deno.test;`;
          }

          const targetNodePath = join(dirname(nodePath), target);
          const targetNodePathIfFile = targetNodePath + '.ts';
          const targetNodePathIfDir = join(targetNodePath, 'index.ts');

          if (statSync(targetNodePathIfFile)?.isFile()) {
            return line.replace(target, target + '.ts');
          }

          if (statSync(targetNodePathIfDir)?.isFile()) {
            return line.replace(target, join(target, 'index.ts'));
          }

          console.warn(`Skipping non-resolvable import:\n  ${line}`);
          return line;
        },
      );

      writeFileSync(denoPath, denoSource, {encoding: "utf-8"});
    }
  }
};

walkAndBuild('./');
