import { defineProject, mergeConfig } from "vitest/config";
// @ts-ignore
import rootConfig from "../../vitest.root.mjs";

export default mergeConfig(rootConfig, defineProject({})) as object;
