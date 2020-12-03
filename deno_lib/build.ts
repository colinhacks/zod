#!/usr/bin/env -S deno run --allow-write --allow-read
import * as path from 'https://deno.land/std@0.79.0/path/mod.ts';
import { walk } from 'https://deno.land/std@0.78.0/fs/walk.ts';

const nodeRoot = '../src';
const denoRoot = './src';

if (new URL(import.meta.url).protocol === 'file:') {
  Deno.chdir(new URL('.', import.meta.url).pathname);
}

try {
  await Deno.remove(denoRoot, { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}
await Deno.mkdir(denoRoot);

for await (const entry of walk(nodeRoot, {
  includeDirs: false,
  exts: ['.ts'],
})) {
  const nodePath = entry.path;
  const relativePath = path.relative(nodeRoot, nodePath);
  const denoPath = path.join(denoRoot, relativePath);

  await Deno.mkdir(path.dirname(denoPath), { recursive: true });

  const nodeSource = await Deno.readTextFile(nodePath);

  const denoSource = nodeSource.replace(
    /^(?:import|export)[\s\S]*?from\s*['"]([^'"]*)['"];$/gm,
    (line, target) => {
      if (target === '@jest/globals') {
        return line.replace(target, 'https://deno.land/x/expect@v0.2.6/mod.ts');
      }

      const targetPath = path.join(path.dirname(nodePath), target);
      const targetPathIfFile = targetPath + '.ts';
      const targetPathIfDir = targetPath + '/index.ts';

      let targetFile = null;
      try {
        targetFile = Deno.statSync(targetPathIfFile);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }

      if (targetFile?.isFile) {
        return line.replace(target, target + '.ts');
      }

      let targetInDir = null;
      try {
        targetInDir = Deno.statSync(targetPathIfDir);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }

      if (targetInDir?.isFile) {
        return line.replace(target, target + '/index.ts');
      }

      console.warn(`Skipping non-resolvable import:\n  ${line}`);
      return line;
    },
  );

  await Deno.writeTextFile(denoPath, denoSource);
  console.debug(`wrote ${denoPath}`);
}
