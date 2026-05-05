#!/usr/bin/env tsx

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Files in the import chain to v4/classic/external.js's `config(en())` —
// every link must be flagged, not just the terminal.
const SIDE_EFFECTFUL_STUBS: Record<string, readonly string[]> = {
  v4: ["./index.js", "./index.cjs"],
  "v4/classic": ["./index.js", "./index.cjs", "./external.js", "./external.cjs"],
};

function stubFor(dir: string): string {
  const normalized = dir.split(/[\\/]/).join("/");
  const sideEffects: false | readonly string[] = SIDE_EFFECTFUL_STUBS[normalized] ?? false;
  return `{
  "type": "module",
  "main": "./index.cjs",
  "module": "./index.js",
  "types": "./index.d.cts",
  "sideEffects": ${JSON.stringify(sideEffects)}
}
`;
}

/**
 * Recursively find all index.d.cts files in a directory
 */
function findIndexJsFiles(dir: string, relativePath = ""): string[] {
  const results: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      // Skip node_modules
      if (entry !== "node_modules") {
        const fullPath = join(dir, entry);
        const relativeFilePath = relativePath ? join(relativePath, entry) : entry;

        try {
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Recursively search subdirectories
            results.push(...findIndexJsFiles(fullPath, relativeFilePath));
          } else if (entry === "index.d.cts") {
            // Found an index.d.cts file
            results.push(relativePath || ".");
          }
        } catch {
          // Skip files/directories we can't access
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return results;
}

/**
 * Script to write stub package.json files to directories containing index.d.cts files.
 * This resolves TypeScript assignability issues by providing explicit type declarations.
 */
function writeStubPackageJsons() {
  const zodPackageRoot = join(import.meta.dirname, "../packages/zod");

  // Find all directories containing index.d.cts files
  const dirsWithIndexJs = findIndexJsFiles(zodPackageRoot);

  const processedDirs = new Set<string>();

  for (const dir of dirsWithIndexJs) {
    // Skip root directory (it already has a proper package.json)
    if (dir === ".") {
      continue;
    }

    // Avoid duplicate processing
    if (processedDirs.has(dir)) {
      continue;
    }
    processedDirs.add(dir);

    const packageJsonPath = join(zodPackageRoot, dir, "package.json");

    // Write the stub package.json
    writeFileSync(packageJsonPath, stubFor(dir), "utf8");
    console.log(`✅ Created ${dir}/package.json`);
  }

  console.log("\n✨ Done! All stub package.json files have been created.");
}

// Run the script
writeStubPackageJsons();
