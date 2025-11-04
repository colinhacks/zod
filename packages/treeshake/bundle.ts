import { build } from "esbuild";
import { readFileSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const entryPoint = process.argv[2];

if (!entryPoint) {
  console.error("Error: Please provide an entry point");
  console.error("Usage: pnpm bundle <entry>");
  process.exit(1);
}

const outFileLocal = resolve(process.cwd(), "out-local.js");
const outFileInstalled = resolve(process.cwd(), "out-installed.js");
const tempEntryFile = resolve(process.cwd(), ".temp-entry.ts");

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  return `${(bytes / 1024).toFixed(2)}kb`;
}

async function bundleWithConditions(
  conditions: string[] | undefined,
  label: string,
  useZod4: boolean = false,
): Promise<{ size: number; gzipped: number } | null> {
  // Suppress esbuild's stderr output
  const originalStderr = process.stderr.write.bind(process.stderr);
  let errorOutput = "";
  
  process.stderr.write = ((chunk: any) => {
    errorOutput += chunk.toString();
    return true;
  }) as typeof process.stderr.write;

  let actualEntryPoint = entryPoint;
  let tempFileCreated = false;

  try {
    // If using zod4, create a temp entrypoint with imports replaced
    if (useZod4) {
      const originalContent = readFileSync(entryPoint, "utf-8");
      const modifiedContent = originalContent.replace(
        /from\s+["']zod\//g,
        'from "zod4/',
      );
      writeFileSync(tempEntryFile, modifiedContent);
      actualEntryPoint = tempEntryFile;
      tempFileCreated = true;
    }

    const outfile = useZod4 ? outFileInstalled : outFileLocal;
    
    await build({
      entryPoints: [actualEntryPoint],
      bundle: true,
      format: "esm",
      outfile,
      conditions,
      write: true,
      logLevel: "silent",
    });

    // Restore stderr
    process.stderr.write = originalStderr;

    // Clean up temp file
    if (tempFileCreated) {
      unlinkSync(tempEntryFile);
    }

    const stats = statSync(outfile);
    const contents = readFileSync(outfile);
    const gzipped = gzipSync(contents);

    return {
      size: stats.size,
      gzipped: gzipped.length,
    };
  } catch (error) {
    // Restore stderr
    process.stderr.write = originalStderr;
    
    // Clean up temp file on error
    if (tempFileCreated) {
      try {
        unlinkSync(tempEntryFile);
      } catch {
        // Ignore cleanup errors
      }
    }
    
    console.error(`  ❌ ${label}: Build failed`);
    if (error instanceof Error) {
      // Extract a clean error message
      const errorLines = errorOutput.split("\n");
      const errorLine = errorLines.find((line) => 
        line.includes("ERROR:") || line.includes("Could not resolve")
      );
      if (errorLine) {
        const cleanMessage = errorLine
          .replace("✘ [ERROR] ", "")
          .replace(/ERROR: /, "")
          .trim();
        console.error(`     ${cleanMessage}`);
      } else {
        console.error(`     ${error.message.split("\n")[0]}`);
      }
    }
    return null;
  }
}

function printTable(results: Array<{ label: string; size: number; gzipped: number } | null>) {
  const rows = results.filter((r): r is { label: string; size: number; gzipped: number } => r !== null);
  
  if (rows.length === 0) {
    console.error("\n❌ All builds failed");
    return;
  }

  // Sort by gzipped size (smallest first)
  rows.sort((a, b) => a.gzipped - b.gzipped);
  
  const smallestGzipped = rows[0].gzipped;

  // Calculate column widths
  const labelWidth = Math.max(...rows.map(r => r.label.length), "Bundle".length);
  const sizeWidth = Math.max(...rows.map(r => formatBytes(r.size).length), "Size".length);
  const gzipWidth = Math.max(...rows.map(r => formatBytes(r.gzipped).length), "Gzipped".length);
  const diffWidth = Math.max("Diff".length, "+999%".length);

  // Helper to format percentage difference
  function formatDiff(size: number): string {
    if (size === smallestGzipped) return "—";
    const diff = ((size - smallestGzipped) / smallestGzipped) * 100;
    return `+${diff.toFixed(0)}%`;
  }

  // Print header
  console.log("\n┌" + "─".repeat(labelWidth + 2) + "┬" + "─".repeat(sizeWidth + 2) + "┬" + "─".repeat(gzipWidth + 2) + "┬" + "─".repeat(diffWidth + 2) + "┐");
  console.log(
    "│ " + "Bundle".padEnd(labelWidth) + " │ " + 
    "Size".padEnd(sizeWidth) + " │ " + 
    "Gzipped".padEnd(gzipWidth) + " │ " +
    "Diff".padEnd(diffWidth) + " │"
  );
  console.log("├" + "─".repeat(labelWidth + 2) + "┼" + "─".repeat(sizeWidth + 2) + "┼" + "─".repeat(gzipWidth + 2) + "┼" + "─".repeat(diffWidth + 2) + "┤");

  // Print rows
  for (const row of rows) {
    console.log(
      "│ " + row.label.padEnd(labelWidth) + " │ " + 
      formatBytes(row.size).padEnd(sizeWidth) + " │ " + 
      formatBytes(row.gzipped).padEnd(gzipWidth) + " │ " +
      formatDiff(row.gzipped).padEnd(diffWidth) + " │"
    );
  }

  console.log("└" + "─".repeat(labelWidth + 2) + "┴" + "─".repeat(sizeWidth + 2) + "┴" + "─".repeat(gzipWidth + 2) + "┴" + "─".repeat(diffWidth + 2) + "┘");
}

async function main() {
  console.log(`\n📦 Bundling: ${entryPoint}\n`);

  const results: Array<{ label: string; size: number; gzipped: number } | null> = [];

  // Bundle with local source files (TypeScript)
  const withSource = await bundleWithConditions(
    ["@zod/source"],
    "Local source",
  );
  if (withSource) {
    results.push({ label: "Local source", ...withSource });
  } else {
    results.push(null);
  }

  // Bundle with installed package (use zod4 instead of zod)
  const installed = await bundleWithConditions(
    undefined,
    "Installed package",
    true, // useZod4 = true
  );
  if (installed) {
    results.push({ label: "Installed package", ...installed });
  } else {
    results.push(null);
  }

  printTable(results);
  console.log();
}

main();

