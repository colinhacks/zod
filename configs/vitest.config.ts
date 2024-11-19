import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@jest/globals": "vitest",
    },
    include: ["src/**/*.test.ts", "src/**/*.test-d.ts"],
    isolate: false,
    watch: false,
    typecheck: {
      enabled: true,
      include: ["src/**/*.test-d.ts"],
    },
  },
});
