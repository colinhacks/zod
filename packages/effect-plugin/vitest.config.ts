import { defineConfig, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.root";

const config: Record<string, any> = mergeConfig(rootConfig, defineConfig({}));
export default config;
