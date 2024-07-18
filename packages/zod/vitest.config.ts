import { defineProject, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.root";

export default mergeConfig(rootConfig, defineProject({})) as object;
