#!/usr/bin/env node
/**
 * Tree-Shaking Size Verification
 * 
 * Builds and measures bundle sizes for locale tree-shaking tests.
 * Enforces 15% tolerance above expected sizes to catch regressions.
 * 
 * Test files:
 *   - test-no-locales.ts: Core + English (baseline ~50KB)
 *   - test-one-locale.ts: + German (~55KB)
 *   - test-three-locales.ts: + de/fr/ja (~65KB)
 *   - test-many-locales.ts: + 10 locales (~95KB)
 * 
 * Usage: pnpm verify:sizes
 * 
 * Outputs built bundles to dist/ (gitignored)
 * Fails if any bundle exceeds expected size + 15% tolerance
 */
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
// @ts-ignore - terser types issue
import terser from "@rollup/plugin-terser";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { statSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Expected sizes (in KB) with 15% tolerance
// Note: Tree-shaking removes unused imports, so tests that import
// but don't USE locales will have them stripped from the bundle.
const EXPECTED_SIZES = {
  "test-no-locales": 40,            // Core + English only
  "test-one-locale": 42,            // + 1 additional locale (German) - USED
  "test-three-locales": 42,         // Imports 3, but only USES de - others stripped
  "test-many-locales": 42,          // Imports 10, but only USES de - others stripped
  "test-five-used-locales": 52,     // Imports AND USES 5 locales - should be larger!
  "test-v4mini-large-schema": 15,   // Mini with large schema (no English) - VERY small!
  "test-v4-large-schema": 55,        // V4 with large schema (English + validations)
};

const TOLERANCE = 0.15; // 15% tolerance

const tests = [
  { name: "test-no-locales", description: "Core + English (auto-configured)" },
  { name: "test-one-locale", description: "Core + English + German" },
  { name: "test-three-locales", description: "Core + English + de/fr/ja" },
  { name: "test-many-locales", description: "Core + English + 10 locales" },
  { name: "test-five-used-locales", description: "Core + English + 5 USED locales" },
  { name: "test-v4mini-large-schema", description: "Mini + large schema (no locale)" },
  { name: "test-v4-large-schema", description: "V4 + large schema (English)" },
];

async function buildAndMeasure(testName) {
  try {
    const bundle = await rollup({
      input: join(__dirname, `${testName}.ts`),
      external: [],
      plugins: [
        typescript({
          tsconfig: false,
          compilerOptions: {
            target: "ES2020",
            module: "ESNext",
          },
        }),
        nodeResolve({
          extensions: [".js", ".ts"],
          mainFields: ["module", "main"],
        }),
        // @ts-ignore
        terser({
          compress: {
            passes: 2,
          },
        }),
      ],
    });

    // Create dist directory if it doesn't exist
    mkdirSync(join(__dirname, "dist"), { recursive: true });

    // Write the bundle
    await bundle.write({
      file: join(__dirname, `dist/${testName}.js`),
      format: "esm",
    });

    // Get the file size
    const stats = statSync(join(__dirname, `dist/${testName}.js`));
    const sizeKB = (stats.size / 1024).toFixed(2);

    return { size: stats.size, sizeKB: parseFloat(sizeKB) };
  } catch (error) {
    console.error(`❌ Failed to build ${testName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🔍 Tree-shaking Size Verification\n");
  console.log("=".repeat(70));

  const results = [];
  let allPassed = true;

  for (const test of tests) {
    try {
      const { sizeKB } = await buildAndMeasure(test.name);
      const expectedSize = EXPECTED_SIZES[test.name];
      const maxSize = expectedSize * (1 + TOLERANCE);
      const minSize = expectedSize * (1 - TOLERANCE);
      const passed = sizeKB <= maxSize;

      results.push({
        ...test,
        sizeKB,
        expectedSize,
        maxSize,
        passed,
      });

      if (!passed) {
        allPassed = false;
      }

      const status = passed ? "✅ PASS" : "❌ FAIL";
      console.log(`\n${status} ${test.name}`);
      console.log(`  Description: ${test.description}`);
      console.log(`  Actual size: ${sizeKB} KB`);
      console.log(`  Expected: ${expectedSize} KB (max: ${maxSize.toFixed(2)} KB)`);

      if (!passed) {
        const diff = ((sizeKB - expectedSize) / expectedSize * 100).toFixed(1);
        console.log(`  ⚠️  Size exceeded by ${diff}%`);
      }
    } catch (error) {
      console.error(`\n❌ ERROR building ${test.name}`);
      allPassed = false;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 Summary:\n");
  
  const baseline = results[0];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const diff = i > 0 ? (result.sizeKB - baseline.sizeKB).toFixed(2) : "baseline";
    console.log(`${result.passed ? "✅" : "❌"} ${result.name.padEnd(25)} ${String(result.sizeKB).padStart(8)} KB  (+${diff === "baseline" ? "0.00" : diff} KB from baseline)`);
  }

  // Calculate savings vs old approach
  const oldSize = 220; // Approximate size with all 47 locales
  const newSize = baseline.sizeKB;
  const savings = oldSize - newSize;
  const savingsPercent = (savings / oldSize * 100).toFixed(1);

  console.log(`\n💡 Bundle size savings: ${savings.toFixed(2)} KB (~${savingsPercent}% reduction)`);
  console.log(`   Before tree-shaking: ~${oldSize} KB (all 47 locales)`);
  console.log(`   After tree-shaking:  ~${newSize} KB (English only)`);

  // Compare Mini vs V4
  const miniResult = results.find(r => r.name === "test-v4mini-large-schema");
  const v4Result = results.find(r => r.name === "test-v4-large-schema");
  if (miniResult && v4Result) {
    const diff = v4Result.sizeKB - miniResult.sizeKB;
    const percent = ((diff / miniResult.sizeKB) * 100).toFixed(1);
    console.log(`\n🔍 Mini vs V4 (with large schema):`);
    console.log(`   Mini:  ${miniResult.sizeKB.toFixed(2)} KB (no English locale)`);
    console.log(`   V4:    ${v4Result.sizeKB.toFixed(2)} KB (English auto-configured)`);
    console.log(`   Difference: ${diff.toFixed(2)} KB (~${percent}% larger for English)`);
  }

  if (!allPassed) {
    console.log("\n❌ Some size tests failed!");
    console.log("   This might indicate:");
    console.log("   - Regression in tree-shaking effectiveness");
    console.log("   - New dependencies added");
    console.log("   - Need to update expected size constants");
    process.exit(1);
  }

  console.log("\n✅ All size tests passed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
