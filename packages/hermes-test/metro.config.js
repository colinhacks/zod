// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add workspace root and built Zod package to watchFolders
config.watchFolders = [
  workspaceRoot,
  path.resolve(projectRoot, "../zod/dist"), // Point to the built distribution files
];

// Configure module resolution paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.sourceExts = ["mjs", "js", "json", "ts", "tsx"];
// even though this is true by default, it seems to help zod
// TODO: revisit if we find a smoking gun, and remove if we can
config.resolver.unstable_enablePackageExports = true;

// Ignore require cycles by pattern
config.resolver.requireCycleIgnorePatterns = [
  // Default patterns
  /(^|\/|\\)node_modules($|\/|\\)/, 
  /(^|\/|\\)packages($|\/|\\)/,
  // Specific Zod cycles
  /\/zod\/dist\/esm\/v4\/classic\/schemas\.js/,
  /\/zod\/dist\/esm\/v4\/classic\/iso\.js/,
  /\/zod\/dist\/esm\/v4\/classic\/coerce\.js/
];

module.exports = config;
