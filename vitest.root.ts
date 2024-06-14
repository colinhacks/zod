import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    isolate: false,
    watch: false,
    typecheck: {
      enabled: true,
      include: ["['**/*.{test,spec}-d.?(c|m)[jt]s?(x)']", "**/*.test.ts"],
    },
  },
});
