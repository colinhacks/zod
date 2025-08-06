import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
