import { defineProject } from "vitest/config";

export default defineProject({
  resolve: {
    conditions: ["@zod/source", "default"],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 180000,
  },
});
