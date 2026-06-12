import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type ViteUserConfig, defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Re-runs the zod package tests with global AOT compilation enabled. Catches
// any divergence between the compiled fast path and the runtime parser across
// the existing test corpus. Wired into the default `pnpm test` run via the
// projects array in vitest.config.ts; can also be invoked directly via
// `pnpm test:compile`.
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
    setupFiles: [resolve(__dirname, "scripts/fail-on-console.ts"), resolve(__dirname, "scripts/enable-compile.ts")],
    typecheck: { enabled: false },
  },
}) as ViteUserConfig;
