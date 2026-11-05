#!/usr/bin/env node
// The chrome-devtools MCP server for this repo, the command `.mcp.json` runs. It pins the server's version and chooses its browser.

// `chrome-devtools-mcp` launches the installed Google Chrome unless it is handed `--executablePath`, so this resolves the `chrome-headless-shell` that puppeteer downloads and passes that in. It fails closed: with no headless shell it exits rather than let the server fall back to the installed Chrome. `npx @puppeteer/browsers@3.2.6 install chrome-headless-shell@stable --path ~/.cache/puppeteer` provides one.

// The version is exact, not `latest`, so a newly published release never runs here unreviewed. `nub dlx` adds its own release-age window and skips lifecycle scripts. Raise the pin by hand after checking the release on npm.

// Extra arguments pass through, so `node scripts/chrome-devtools-mcp.mjs --logFile=/tmp/x.log` works.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PACKAGE = "chrome-devtools-mcp@1.12.0";

async function headlessShellPath() {
  try {
    const { default: puppeteer } = await import("puppeteer");
    const resolved = await puppeteer.executablePath({ headless: "shell" });
    if (fs.existsSync(resolved)) return resolved;
  } catch {
    // No puppeteer in this repo or worktree; the download cache below is shared by every checkout.
  }

  // `os.userInfo()` reads the account's home from the user database, so a sandbox that points HOME elsewhere still finds the cache.
  const caches = [process.env.PUPPETEER_CACHE_DIR, path.join(os.homedir(), ".cache", "puppeteer"), path.join(os.userInfo().homedir, ".cache", "puppeteer")];
  for (const cache of caches) {
    if (!cache || !fs.existsSync(cache)) continue;
    const found = fs
      .globSync("chrome-headless-shell/*/chrome-headless-shell-*/chrome-headless-shell{,.exe}", { cwd: cache })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (found.length > 0) return path.join(cache, found[found.length - 1]);
  }
  return undefined;
}

const executablePath = await headlessShellPath();
if (!executablePath) {
  console.error(
    "chrome-devtools-mcp: no chrome-headless-shell found. Install one with `npx @puppeteer/browsers@3.2.6 install chrome-headless-shell@stable --path ~/.cache/puppeteer`. Refusing to fall back to the installed Chrome."
  );
  process.exit(1);
}

const args = ["dlx", PACKAGE, "--headless", "--isolated", "--no-usage-statistics", `--executablePath=${executablePath}`, ...process.argv.slice(2)];
const env = { ...process.env, NODE_COMPAT: "1" };

// Become nub rather than parent it, so no extra node process stays alive for this file.
if (typeof process.execve === "function") {
  const nub = (process.env.PATH ?? "")
    .split(path.delimiter)
    .map((dir) => path.join(dir, "nub"))
    .find((file) => fs.existsSync(file));
  if (nub) process.execve(nub, ["nub", ...args], env);
}

const child = spawn("nub", args, { stdio: "inherit", env, shell: process.platform === "win32" });
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
