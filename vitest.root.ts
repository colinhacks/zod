import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    isolate: false,
    watch: false,
    typecheck: {
      enabled: true,
      include: ["**/*.test.ts"],
    },
  },
});
