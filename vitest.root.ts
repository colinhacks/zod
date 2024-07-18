import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    isolate: false,
    typecheck: {
      enabled: true,
      ignoreSourceErrors: false,
    },
  },
}) as UserConfig;
