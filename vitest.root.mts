import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["@zod/source"],
  },
  test: {
    watch: false,
    isolate: false,
    // typecheck: {
    //   enabled: true,
    //   ignoreSourceErrors: false,
    // },
    // coverage: {
    //   provider: "istanbul", // or 'v8'
    // },
    // reporters: [
    //   // "basic", { summary: false }
    //   ["basic", { summary: false }],
    // ],
    // reporters: false,
    silent: true,
  },
}) as UserConfig;
