import { defineProject, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.root.mjs";

const config: Record<string, any> = mergeConfig(rootConfig, defineProject({}));
export default config;
