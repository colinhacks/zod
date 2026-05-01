import { statSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "vitest";

// Locks in the contract of scripts/recheck-resolve.ts: when an optional
// `recheck` backend package is installed, the corresponding env var
// must point to a real file after vitest setup runs. On platforms/archs
// without any installed `recheck` backend (e.g. s390x, riscv64,
// FreeBSD), the setup is a no-op and this test skips.
const requireFromHere = createRequire(import.meta.url);

function isResolvable(specifier: string): boolean {
  try {
    requireFromHere.resolve(specifier);
    return true;
  } catch {
    return false;
  }
}

const PLATFORM: Record<string, string> = { darwin: "macos", linux: "linux", win32: "windows" };
const ARCH: Record<string, string> = { x64: "x64", arm64: "arm64" };
const nativePackage =
  PLATFORM[process.platform] && ARCH[process.arch]
    ? `recheck-${PLATFORM[process.platform]}-${ARCH[process.arch]}/package.json`
    : null;

const hasAnyBackend =
  isResolvable("recheck-jar/package.json") || (nativePackage !== null && isResolvable(nativePackage));

test.skipIf(!hasAnyBackend)("recheck-resolve setup file points recheck at the installed backend(s)", () => {
  const bin = process.env.RECHECK_BIN;
  const jar = process.env.RECHECK_JAR;

  expect(bin || jar, "neither RECHECK_BIN nor RECHECK_JAR was set by scripts/recheck-resolve.ts").toBeTruthy();

  if (bin) expect(statSync(bin).isFile(), `RECHECK_BIN missing: ${bin}`).toBe(true);
  if (jar) {
    expect(jar).toMatch(/recheck\.jar$/);
    expect(statSync(jar).isFile(), `RECHECK_JAR missing: ${jar}`).toBe(true);
  }
});
