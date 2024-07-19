import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["@zod/source"],
  },
  test: {
    watch: false,
    isolate: false,
    typecheck: {
      enabled: true,
      ignoreSourceErrors: false,
    },
  },
}) as UserConfig;
