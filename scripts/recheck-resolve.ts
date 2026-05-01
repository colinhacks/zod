import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// `recheck`'s backend resolution does
// `require.resolve(pkg).replace(/\/package\.json$/, "/<bin>")` for both
// the JVM jar and the native binary. The forward-slash regex no-ops on
// Windows backslash paths, so `recheck` invokes Java/exe with
// `package.json` as the executable. We resolve both ourselves and set
// the env vars `recheck` already honours as overrides.
const requireFromHere = createRequire(import.meta.url);

const RECHECK_PLATFORM: Partial<Record<NodeJS.Platform, string>> = {
  darwin: "macos",
  linux: "linux",
  win32: "windows",
};
const RECHECK_ARCH: Partial<Record<NodeJS.Architecture, string>> = {
  x64: "x64",
  arm64: "arm64",
};

function isModuleNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "MODULE_NOT_FOUND";
}

function resolveOptional(specifier: string, file: string): string | undefined {
  try {
    const path = join(dirname(requireFromHere.resolve(specifier)), file);
    return existsSync(path) ? path : undefined;
  } catch (err) {
    if (isModuleNotFound(err)) return undefined;
    throw err;
  }
}

if (!process.env.RECHECK_BIN) {
  const platform = RECHECK_PLATFORM[process.platform];
  const arch = RECHECK_ARCH[process.arch];
  if (platform && arch) {
    const bin = resolveOptional(
      `recheck-${platform}-${arch}/package.json`,
      platform === "windows" ? "recheck.exe" : "recheck"
    );
    if (bin) process.env.RECHECK_BIN = bin;
  }
}

if (!process.env.RECHECK_JAR) {
  const jar = resolveOptional("recheck-jar/package.json", "recheck.jar");
  if (jar) process.env.RECHECK_JAR = jar;
}
