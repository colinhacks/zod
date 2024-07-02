import { defineConfig, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.root";

export default mergeConfig(rootConfig, defineConfig({})) as object;
