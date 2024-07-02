import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    isolate: false,
    watch: false,
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
      include: ["**/*.test.ts"],
    },
  },
}) as UserConfig;
