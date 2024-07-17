import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/*",
  {
    extends: "./vitest.root.ts",
    test: {
      include: ["**/*.test.ts"],
      isolate: false,
    },
  },
  {
    extends: "./vitest.root.ts",
    test: {
      typecheck: {
        enabled: true,
        ignoreSourceErrors: true,
        include: ["**/*.test.ts"],
      },
    },
  },
]) as ReturnType<typeof defineWorkspace>;
