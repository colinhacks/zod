import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type ViteUserConfig, defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Re-runs the zod package tests with global AOT compilation enabled. Surfaces
// success-path divergence between the compiled fast path and the runtime
// parser across the entire existing test corpus. See wiki/compile-plan.md
// "Phase 2b".
//
// Invoke via `pnpm test:compile`. Not part of the default `pnpm test` run
// because there are known divergences pending Phase 4 fixes.
export default defineConfig({
  resolve: {
    conditions: ["@zod/source", "default"],
    externalConditions: ["@zod/source", "default"],
  },
  ssr: {
    resolve: {
      conditions: ["@zod/source", "default"],
      externalConditions: ["@zod/source", "default"],
    },
  },
  test: {
    name: { label: "compile-mode", color: "magenta" },
    watch: false,
    isolate: true,
    silent: true,
    include: ["packages/zod/src/**/*.test.ts"],
    setupFiles: [
      resolve(__dirname, "scripts/fail-on-console.ts"),
      resolve(__dirname, "scripts/enable-compile.ts"),
    ],
    typecheck: { enabled: false },
  },
}) as ViteUserConfig;
