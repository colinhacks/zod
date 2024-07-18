import { defineProject, mergeConfig } from "vitest/config";
// @ts-ignore
import rootConfig from "../../vitest.root.js";

export default mergeConfig(rootConfig, defineProject({})) as object;
