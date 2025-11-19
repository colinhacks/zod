import { build } from "esbuild";
import { expect, test } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Expected bundle sizes (in bytes) - set to current size
// Update these when intentionally changing bundle size
const EXPECTED_SIZES = {
  // Core + English locale only (default import)
  defaultImport: 24_000,
  
  // Core + English + 1 additional locale
  withOneExtraLocale: 28_000,
};

// Allow 10% variance
const TOLERANCE = 0.10;

test("bundle size - default import (core + English)", async () => {
  const result = await build({
    entryPoints: [join(__dirname, "zod-v4-treeshake.ts")],
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    platform: "browser",
  });

  const size = result.outputFiles[0].contents.length;
  const maxSize = EXPECTED_SIZES.defaultImport * (1 + TOLERANCE);
  
  console.log(`Bundle size (default): ${size} bytes`);
  console.log(`Expected: ${EXPECTED_SIZES.defaultImport} bytes`);
  console.log(`Max allowed: ${Math.round(maxSize)} bytes (${TOLERANCE * 100}% tolerance)`);
  
  expect(size).toBeLessThanOrEqual(maxSize);
  
  // Warn if significantly smaller (might indicate broken build)
  const minSize = EXPECTED_SIZES.defaultImport * 0.5;
  if (size < minSize) {
    console.warn(`⚠️ Bundle is suspiciously small (${size} bytes). Expected ~${EXPECTED_SIZES.defaultImport} bytes.`);
  }
});

test("bundle size - with extra locale", async () => {
  const result = await build({
    entryPoints: [join(__dirname, "zod-v4-with-locale.ts")],
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    platform: "browser",
  });

  const size = result.outputFiles[0].contents.length;
  const maxSize = EXPECTED_SIZES.withOneExtraLocale * (1 + TOLERANCE);
  
  console.log(`Bundle size (with German): ${size} bytes`);
  console.log(`Expected: ${EXPECTED_SIZES.withOneExtraLocale} bytes`);
  console.log(`Max allowed: ${Math.round(maxSize)} bytes (${TOLERANCE * 100}% tolerance)`);
  
  expect(size).toBeLessThanOrEqual(maxSize);
});

test("locale tree-shaking works", async () => {
  const defaultResult = await build({
    entryPoints: [join(__dirname, "zod-v4-treeshake.ts")],
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    platform: "browser",
  });

  const withLocaleResult = await build({
    entryPoints: [join(__dirname, "zod-v4-with-locale.ts")],
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    platform: "browser",
  });

  const defaultSize = defaultResult.outputFiles[0].contents.length;
  const withLocaleSize = withLocaleResult.outputFiles[0].contents.length;
  const diff = withLocaleSize - defaultSize;
  
  console.log(`Size difference: ${diff} bytes`);
  console.log(`Per-locale overhead: ~${diff} bytes (German locale)`);
  
  // German locale should add roughly 4KB, not 196KB (all locales)
  expect(diff).toBeLessThan(10_000); // Should be < 10KB
  expect(diff).toBeGreaterThan(2_000); // Should be > 2KB (sanity check)
});
