import type { UserConfig } from "vitest/config";

export default {
  test: {
    alias: {
      "@jest/globals": "vitest",
    },
    include: ["**/*.test.ts"],
    isolate: false,
    watch: false,
  },
} satisfies UserConfig;
