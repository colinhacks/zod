import { type ViteUserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["@zod/source"],
  },
  test: {
    watch: false,
    isolate: true,
    typecheck: {
      include: ["**/*.test.ts"],
      enabled: true,
      ignoreSourceErrors: false,
      checker: "tsc",
      tsconfig: "./tsconfig.json",
    },
    silent: true,
  },
}) as ViteUserConfig;
