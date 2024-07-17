import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
  },
}) as UserConfig;
