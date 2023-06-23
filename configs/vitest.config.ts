import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@jest/globals": "vitest",
    },
    include: ["src/**/*.test.ts"],
    isolate: false,
    watch: false,
  },
});
