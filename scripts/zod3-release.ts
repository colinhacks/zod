#!/usr/bin/env nub

import { execFile, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { availableParallelism, tmpdir } from "node:os";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";
import { isDeepStrictEqual, promisify } from "node:util";

// the zod@3.25.N tarball `.github/workflows/release-v3.yml` stages: main's own build in zod@3.25.76's layout, with main's Zod 3 at `zod` and `zod/v3`, main's Zod 4 under 3.25.76's `zod/v4*` subpaths, and none of main's other subpaths
//
// - `build <version> [--out <dir>]` runs main's build, assembles, checks and packs, writing `zod-<version>.tgz` and `zod-<version>.manifest.md`
// - `verify <tarball> <version>` re-checks a packed tarball's structure with node built-ins only, executing none of its code
// - `smoke <tarball>` loads every subpath, requires 3.25.76's export names, runs main's v3 suite against the built files, and type-checks consumers on TypeScript 4.5 to 7
// - `snapshot <zod-3.25.76.tgz>` regenerates `scripts/zod3-release.3.25.76.json`, the package.json and export names the checks hold the release to

const ROOT = resolve(import.meta.dirname, "..");
const ZOD = "packages/zod";
const SNAPSHOT = join(ROOT, "scripts/zod3-release.3.25.76.json");
const BASE_INTEGRITY =
  "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==";

// the root entry re-exports v3 exactly as 3.25.76's did
const ROOT_INDEX = `import * as z from "./v3/external.js";
export * from "./v3/external.js";
export { z };
export default z;
`;
const ROOT_TEXT: Record<string, string> = {
  "src/index.ts": ROOT_INDEX,
  "index.js": ROOT_INDEX,
  "index.d.ts": ROOT_INDEX,
  "index.d.cts": ROOT_INDEX.replaceAll('.js"', '.cjs"'),
};

// what main's postbuild writes beside every built index.d.cts
const STUB = { type: "module", main: "./index.cjs", module: "./index.js", types: "./index.d.cts", sideEffects: false };

const BUILT = /\.(d\.cts|d\.ts|cjs|js)$/;
const FORMS = [".js", ".cjs", ".d.ts", ".d.cts"];
const stem = (file: string) => file.replace(BUILT, "");

type Surface = Record<string, { import: string[]; require: string[] }>;
type Snapshot = { version: string; integrity: string; packageJson: Record<string, any>; surface: Surface };

class Failure extends Error {
  details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.details = details;
  }
}

function fail(message: string, details: string[] = []): never {
  throw new Failure(message, details);
}

function ok(message: string) {
  console.log(`✅ ${message}`);
}

const sha256 = (data: Buffer | string) => createHash("sha256").update(data).digest("hex");
const integrity = (data: Buffer) => `sha512-${createHash("sha512").update(data).digest("base64")}`;
const snapshot = (): Snapshot => JSON.parse(readFileSync(SNAPSHOT, "utf8"));

// `3.25.N` above 76: the 3.x line takes patches only
function checkVersion(version: string) {
  const m = /^3\.25\.(0|[1-9]\d*)$/.exec(version ?? "");
  if (!m || Number(m[1]) <= 76) fail(`version must be 3.25.N with N > 76, got ${JSON.stringify(version)}`);
}

function files(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(full, base));
    else if (entry.isFile()) out.push(relative(base, full).split(sep).join("/"));
    else fail(`${relative(base, full)} is neither a file nor a directory`);
  }
  return out.sort();
}

function unpack(tarball: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  execFileSync("tar", ["-xzf", tarball, "-C", dir]);
  const top = readdirSync(dir);
  if (top.length !== 1 || top[0] !== "package" || !lstatSync(join(dir, "package")).isDirectory()) {
    fail(`${tarball} does not hold a single package/ directory`, top);
  }
  return join(dir, "package");
}

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

// the checkout's committed packages/zod; anything uncommitted there would ship bytes no commit holds
function committed(): Map<string, Buffer> {
  const dirty = git("status", "--porcelain", "--", ZOD);
  if (dirty) fail(`${ZOD} has uncommitted changes`, dirty.split("\n"));
  const out = new Map<string, Buffer>();
  for (const file of git("ls-files", "-z", "--", ZOD).split("\0").filter(Boolean)) {
    out.set(file.slice(ZOD.length + 1), readFileSync(join(ROOT, file)));
  }
  return out;
}

// 3.25.76's package.json with the version, plus the nested stub package.json files main's build ships; its `zshy` build config and dev `scripts` describe a build this tarball does not come from, so they go
function packageJson(version: string): string {
  const out: Record<string, any> = { ...snapshot().packageJson, version };
  out.files = [...out.files, "**/package.json"];
  delete out.zshy;
  delete out.scripts;
  return `${JSON.stringify(out, null, 2)}\n`;
}

// the relative specifiers a built file names, which is every `./` or `../` string literal in zshy's output
function specifiers(text: string): string[] {
  return [...text.matchAll(/["'](\.\.?\/[^"'\n]+)["']/g)].map((m) => m[1]);
}

function target(from: string, spec: string): string {
  return normalize(join(dirname(from), spec))
    .split(sep)
    .join("/");
}

// the built modules reachable from 3.25.76's exports: every condition's target, and every file under a wildcard
function reachable(dir: string, built: string[]): Set<string> {
  const stems = new Set(built.map(stem));
  const todo: string[] = [];
  for (const [key, conditions] of Object.entries(snapshot().packageJson.exports)) {
    if (key === "./package.json") continue;
    for (const [condition, path] of Object.entries(conditions as Record<string, string>)) {
      if (condition === "@zod/source") continue;
      const file = path.slice(2);
      if (file.includes("*")) {
        const prefix = file.slice(0, file.indexOf("*"));
        todo.push(...built.filter((f) => f.startsWith(prefix)).map(stem));
      } else todo.push(stem(file));
    }
  }
  const seen = new Set<string>();
  while (todo.length) {
    const s = todo.pop()!;
    if (seen.has(s) || !stems.has(s)) continue;
    seen.add(s);
    for (const form of FORMS) {
      const file = s + form;
      if (!existsSync(join(dir, file))) continue;
      for (const spec of specifiers(readFileSync(join(dir, file), "utf8"))) todo.push(stem(target(file, spec)));
    }
  }
  return seen;
}

// the release's invariants on an unpacked tree, with node built-ins and git only
function verifyTree(pkg: string, version: string, source: Map<string, Buffer>) {
  const snap = snapshot();
  const want = packageJson(version);
  const got = readFileSync(join(pkg, "package.json"), "utf8");
  if (got !== want) fail("package.json is not 3.25.76's with the release's version", [got, "--- expected", want]);
  const exportKeys = Object.keys(JSON.parse(got).exports);
  ok(
    `package.json is 3.25.76's but for version ${version} and files, with exactly its exports: ${exportKeys.join(" ")}`
  );

  const all = files(pkg);
  const owned = new Set(
    Object.values(snap.packageJson.exports as Record<string, string | Record<string, string>>)
      .flatMap((c) => (typeof c === "string" ? [] : Object.values(c)))
      .map((p) => p.slice(2).split("/")[0])
      .filter((d) => d !== "src" && !d.includes("."))
  );
  const allowed = (f: string) =>
    ["package.json", "README.md", "LICENSE", ...Object.keys(ROOT_TEXT), "index.cjs"].includes(f) ||
    (owned.has(f.split("/")[0]) && (BUILT.test(f) || f.endsWith("/package.json"))) ||
    (f.startsWith("src/") && owned.has(f.split("/")[1]));
  const stray = all.filter((f) => !allowed(f));
  if (stray.length) fail(`files outside 3.25.76's layout (${[...owned].join(", ")}, src, root index)`, stray);

  const wrong = Object.entries(ROOT_TEXT).filter(
    ([f, text]) => !existsSync(join(pkg, f)) || readFileSync(join(pkg, f), "utf8") !== text
  );
  const cjs = existsSync(join(pkg, "index.cjs")) ? specifiers(readFileSync(join(pkg, "index.cjs"), "utf8")) : [];
  const cjsWrong = !cjs.length || cjs.some((s) => s !== "./v3/external.cjs");
  if (wrong.length || cjsWrong) {
    fail("the root entry does not re-export v3 as 3.25.76's did", [
      ...wrong.map(([f]) => f),
      ...(cjsWrong ? [`index.cjs requires ${cjs.join(", ") || "nothing"}`] : []),
    ]);
  }
  ok("the root entry re-exports v3 as 3.25.76's did, in src/index.ts, index.js, index.cjs, index.d.ts and index.d.cts");

  const built = all.filter((f) => BUILT.test(f) && !f.startsWith("src/") && !(f in ROOT_TEXT) && f !== "index.cjs");
  const stems = [...new Set(built.map(stem))];
  const incomplete = stems.filter((s) => FORMS.some((form) => !all.includes(s + form)) || !all.includes(`src/${s}.ts`));
  if (incomplete.length) fail("built modules without all four forms or their source", incomplete);
  const dangling = [...built, "index.cjs", "index.js", "index.d.ts", "index.d.cts"].flatMap((f) =>
    specifiers(readFileSync(join(pkg, f), "utf8"))
      .map((s) => target(f, s))
      .filter((t) => !all.includes(t))
      .map((t) => `${f} → ${t}`)
  );
  if (dangling.length) fail("built files import files the tarball lacks", dangling);
  const reach = reachable(pkg, built);
  const extra = stems.filter((s) => !reach.has(s));
  if (extra.length) fail("built modules no 3.25.76 subpath reaches", extra);
  ok(
    `${stems.length} built modules, each in four forms with its source, all reachable from the exports and none importing a missing file`
  );

  const exportTargets = Object.values(JSON.parse(got).exports as Record<string, string | Record<string, string>>)
    .flatMap((c) => (typeof c === "string" ? [c] : Object.values(c)))
    .filter((p) => !p.includes("*"))
    .map((p) => p.slice(2));
  const locales = Object.keys(snap.surface)
    .filter((s) => s.startsWith("zod/v4/locales/"))
    .flatMap((s) => FORMS.map((form) => `v4/${stem(s.slice("zod/v4/".length))}${form}`));
  const missing = [...exportTargets, ...locales].filter((f) => !all.includes(f));
  if (missing.length) fail("export targets or 3.25.76 locale files are missing", missing);
  ok(`every export target exists, and all ${locales.length / 4} of 3.25.76's locale files`);

  const stubs = all.filter((f) => f.endsWith("/package.json"));
  const badStubs = stubs.filter((f) => !isDeepStrictEqual(JSON.parse(readFileSync(join(pkg, f), "utf8")), STUB));
  const unstubbed = all.filter(
    (f) => f.endsWith("/index.d.cts") && !stubs.includes(f.replace(/index\.d\.cts$/, "package.json"))
  );
  const loose = stubs.filter((f) => !all.includes(f.replace(/package\.json$/, "index.d.cts")));
  if (badStubs.length || unstubbed.length || loose.length) {
    fail("nested package.json files are not main's stubs", [
      ...badStubs,
      ...unstubbed.map((f) => `no stub beside ${f}`),
      ...loose,
    ]);
  }
  ok(`${stubs.length} nested package.json files are main's stubs, one beside each built index`);

  const shippedSource = all.filter(
    (f) => (f.startsWith("src/") && f !== "src/index.ts") || f === "README.md" || f === "LICENSE"
  );
  const expectedSource = [...source.keys()].filter(
    (f) => (f.startsWith("src/") && owned.has(f.split("/")[1])) || f === "README.md" || f === "LICENSE"
  );
  const drift = [
    ...shippedSource.filter((f) => !source.get(f)?.equals(readFileSync(join(pkg, f)))).map((f) => `~ ${f}`),
    ...expectedSource.filter((f) => !shippedSource.includes(f)).map((f) => `- ${f}`),
  ];
  if (drift.length) fail(`src, README.md and LICENSE are not the checkout's committed ${ZOD}`, drift);
  ok(
    `${shippedSource.length} source, README and LICENSE files are the checkout's committed ${ZOD} (src/${[...owned].join(", src/")})`
  );
}

// main's package as `npm pack` would ship it, and the subset 3.25.76's subpaths need
function plan(): { ship: string[]; dropped: string[] } {
  const dir = join(ROOT, ZOD);
  const [{ files: listed }] = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--loglevel=error"], {
      cwd: dir,
      encoding: "utf8",
    })
  ) as [{ files: { path: string }[] }];
  const main = listed.map((f) => f.path).sort();
  const built = main.filter((f) => BUILT.test(f) && !f.startsWith("src/"));
  const reach = reachable(dir, built);
  const owned = new Set([...reach].map((s) => s.split("/")[0]));
  const replaced = new Set(["package.json", "index.js", "index.cjs", "index.d.ts", "index.d.cts", "src/index.ts"]);
  const keep = (f: string) =>
    !replaced.has(f) &&
    (f === "README.md" ||
      f === "LICENSE" ||
      (BUILT.test(f) && !f.startsWith("src/") && reach.has(stem(f))) ||
      (f.endsWith("/package.json") && reach.has(f.replace(/package\.json$/, "index"))) ||
      (f.startsWith("src/") && owned.has(f.split("/")[1])));
  return { ship: main.filter(keep), dropped: main.filter((f) => !keep(f) && !replaced.has(f)) };
}

// the root entry built by main's own zshy config, in a package of its own so main's root (Zod 4) is untouched
function buildRoot(work: string): Map<string, string> {
  const dir = join(work, "root");
  mkdirSync(join(dir, "src"), { recursive: true });
  cpSync(join(ROOT, ZOD, "src/v3"), join(dir, "src/v3"), { recursive: true });
  writeFileSync(join(dir, "src/index.ts"), ROOT_INDEX);
  const { conditions, sealCjsExports } = JSON.parse(readFileSync(join(ROOT, ZOD, "package.json"), "utf8")).zshy;
  const zshy = { exports: { ".": "./src/index.ts" }, conditions, sealCjsExports };
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "zod", type: "module", zshy }));
  const compilerOptions = { rootDir: "src", outDir: ".", customConditions: ["@zod/source"] };
  const tsconfig = { extends: join(ROOT, ".configs/tsconfig.base.json"), compilerOptions };
  writeFileSync(join(dir, "tsconfig.build.json"), JSON.stringify(tsconfig));
  const bin = join(ROOT, "node_modules/zshy/dist/index.cjs");
  execFileSync(process.execPath, [bin, "--project", "tsconfig.build.json"], { cwd: dir, stdio: "pipe" });
  return new Map(
    ["index.js", "index.cjs", "index.d.ts", "index.d.cts"].map((f) => [f, readFileSync(join(dir, f), "utf8")])
  );
}

// a child `node` with nothing of nub's augmentation, so a probe sees what a consumer's node sees
function plainEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^(NODE_OPTIONS|NODE_COMPAT|NUB_)/.test(key)) delete env[key];
  return env;
}

const run = promisify(execFile);

async function pool<T, R>(items: T[], fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(items.length, availableParallelism()) }, worker));
  return results;
}

function consumer(dir: string, pkg: string, type: "module" | "commonjs"): string {
  mkdirSync(join(dir, "node_modules"), { recursive: true });
  cpSync(pkg, join(dir, "node_modules/zod"), { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", private: true, type }));
  return dir;
}

const PROBE = String.raw`
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const pkg = require("zod/package.json");
const specs = [];
for (const key of Object.keys(pkg.exports)) {
  if (key === "./package.json") continue;
  if (!key.endsWith("/*")) { specs.push(["zod" + key.slice(1), "zod" + key.slice(1)]); continue; }
  const dir = key.slice(2, -2);
  for (const f of readdirSync(new URL("./node_modules/zod/" + dir, import.meta.url)).filter((f) => f.endsWith(".js")).sort()) {
    specs.push(["zod/" + dir + "/" + f, "zod/" + dir + "/" + f.slice(0, -3) + ".cjs"]);
  }
}
const surface = {};
for (const [esm, cjs] of specs) {
  surface[esm] = { import: Object.keys(await import(esm)).sort(), require: Object.keys(require(cjs)).sort() };
}
const parses = [];
const check = (label, z) => {
  const tags = z.array(z.string());
  const schema = z.object({ name: z.string(), tags: tags.max ? tags.max(2) : tags.check(z.maxLength(2)) });
  parses.push([label, JSON.stringify(schema.parse({ name: "a", tags: ["x"] })), schema.safeParse({ name: 1, tags: ["x", "y", "z"] }).error.issues.map((i) => i.code).join()]);
};
check("import zod", (await import("zod")).z);
check("import zod default", (await import("zod")).default);
check("import zod/v3", (await import("zod/v3")).z);
check("import zod/v4", (await import("zod/v4")).z);
check("import zod/v4-mini", (await import("zod/v4-mini")).z);
check("require zod", require("zod").z);
check("require zod/v3", require("zod/v3").z);
check("require zod/v4", require("zod/v4").z);
check("require zod/v4/mini", require("zod/v4/mini"));
const { version } = await import("zod/v4/core");
console.log(JSON.stringify({ surface, parses, v4: version.major + "." + version.minor + "." + version.patch }));
`;

type Probe = { surface: Surface; parses: string[][]; v4: string };

async function probe(dir: string, pkg: string): Promise<Probe> {
  consumer(dir, pkg, "module");
  writeFileSync(join(dir, "probe.mjs"), PROBE);
  const { stdout } = await run(process.execPath, ["probe.mjs"], { cwd: dir, env: plainEnv() }).catch((e) =>
    fail(`the runtime probe fails in ${dir}`, [e.stderr ?? String(e)])
  );
  return JSON.parse(stdout) as Probe;
}

type Added = { subpath: string; import: string[]; require: string[] };

// 3.25.76 export names main's Zod 4 has since dropped, each one a release decision; any other missing name fails, and so does an entry nothing matches any more
const REMOVED: { pattern: RegExp; reason: string; detail?: string }[] = [
  {
    pattern: /^zod\/v4\/core (import|require) function$/,
    reason:
      "`zod/v4/core` no longer exports `function`: core's function schema went in Zod 4.1 (#5130), and `z.function()` from `zod/v4` replaces it",
  },
  {
    pattern: /^zod\/v4\/locales\/(en|eo|tr)\.js (import|require) parsedType$/,
    reason:
      "`zod/v4/locales/en.js`, `eo.js` and `tr.js` no longer export their `parsedType` helper, which the locales stopped sharing in Zod 4.3 (#5584)",
  },
  {
    pattern: /^zod\/v4\/locales\/[\w-]+\.js require default$/,
    reason:
      "`require()` of a locale's `.cjs` returns the locale function itself, with no `.default`: zshy's CommonJS interop for default-only modules, since Zod 4.0.11 (#4981), and for `en`, `eo` and `tr` since #5584 left them default-only",
    detail:
      'In 3.25.76, `require("zod/v4/locales/en.cjs")` returned `{ default: [Function], parsedType: [Function] }`; now it returns the `en` function itself. CommonJS compiled by TypeScript or Babel reads it through `__importDefault` / `_interopRequireDefault` and still gets the function as the default import, and ESM `import en from "zod/v4/locales/en.js"` and `require("zod/v4/locales").en` are unchanged; only a hand-written `require("zod/v4/locales/en.cjs").default` now reads `undefined`, and CommonJS TypeScript that writes `import * as en from "zod/v4/locales/en.cjs"` and calls `en.default()` no longer type-checks.',
  },
];
type Removed = { reason: string; detail?: string; names: string[] };

// every subpath of 3.25.76 must still load and export every name it had; what main adds is release-notes material
async function runtime(work: string, pkg: string): Promise<{ added: Added[]; removed: Removed[]; v4: string }> {
  const got = await probe(join(work, "runtime"), pkg);
  const want = snapshot().surface;
  const missing: string[] = [];
  const added: Added[] = [];
  for (const subpath of Object.keys({ ...want, ...got.surface }).sort()) {
    const w = want[subpath];
    const g = got.surface[subpath];
    if (!g) {
      missing.push(`${subpath} (the whole subpath)`);
      continue;
    }
    if (w) {
      for (const via of ["import", "require"] as const) {
        for (const n of w[via]) if (!g[via].includes(n)) missing.push(`${subpath} ${via} ${n}`);
      }
    }
    const a = {
      subpath,
      import: g.import.filter((n) => !w?.import.includes(n)),
      require: g.require.filter((n) => !w?.require.includes(n)),
    };
    if (!w || a.import.length || a.require.length) added.push(a);
  }
  const removed = REMOVED.map(({ pattern, ...r }) => ({ ...r, names: missing.filter((m) => pattern.test(m)) }));
  const unaccepted = missing.filter((m) => !REMOVED.some(({ pattern }) => pattern.test(m)));
  if (unaccepted.length) fail(`exports zod@${snapshot().version} had are missing`, unaccepted);
  const stale = removed.filter((r) => !r.names.length);
  if (stale.length)
    fail(
      "accepted removals that are no longer missing; drop them from REMOVED",
      stale.map((r) => r.reason)
    );
  const subpaths = Object.keys(got.surface).length;
  ok(
    `import() and require() of all ${subpaths} subpaths keep every export name of 3.25.76's ${Object.keys(want).length}, but for ${missing.length} accepted removals`
  );
  for (const r of removed) console.log(`   ${r.names.length} removed: ${r.reason}`);
  const bad = got.parses.filter((p) => p[1] !== '{"name":"a","tags":["x"]}' || p[2] !== "invalid_type,too_big");
  if (bad.length)
    fail(
      "a parse through the built package misbehaves",
      got.parses.map((p) => p.join(" → "))
    );
  ok("parses through zod, zod/v3, zod/v4 and zod/v4-mini, ESM and CJS, succeed and fail as they should");
  return { added, removed, v4: got.v4 };
}

async function build(version: string, outDir: string) {
  checkVersion(version);
  committed();
  const env = { ...process.env };
  delete env.NODE_COMPAT;
  execFileSync("nub", ["run", "build"], { cwd: join(ROOT, ZOD), env, stdio: "pipe" });
  const source = committed();
  const commit = git("rev-parse", "HEAD");
  ok(`built ${ZOD} at ${commit.slice(0, 12)} with its own \`nub run build\``);

  const work = mkdtempSync(join(tmpdir(), "zod3-build-"));
  const pkg = join(work, "package");
  const { ship, dropped } = plan();
  for (const file of ship) {
    mkdirSync(join(pkg, file, ".."), { recursive: true });
    cpSync(join(ROOT, ZOD, file), join(pkg, file));
  }
  for (const [file, text] of buildRoot(work)) writeFileSync(join(pkg, file), text);
  writeFileSync(join(pkg, "src/index.ts"), ROOT_INDEX);
  writeFileSync(join(pkg, "package.json"), packageJson(version));
  ok(`took ${ship.length} of main's ${ship.length + dropped.length + 6} packed files; left out ${dropped.length}`);
  verifyTree(pkg, version, source);

  mkdirSync(outDir, { recursive: true });
  const tarball = join(outDir, `zod-${version}.tgz`);
  rmSync(tarball, { force: true });
  execFileSync("npm", ["pack", "--ignore-scripts", "--silent", "--pack-destination", outDir], {
    cwd: pkg,
    stdio: "pipe",
  });
  if (!existsSync(tarball)) fail(`npm pack did not write ${tarball}`);

  // what ships is the tarball, so the checks run again on it, and its bytes must be the tree's and main's build's
  console.log(`\nzod-${version}.tgz:`);
  const packed = unpack(tarball, join(work, "packed"));
  verifyTree(packed, version, source);
  const all = files(packed);
  const differ = [
    ...files(pkg).filter((f) => !all.includes(f) || !readFileSync(join(pkg, f)).equals(readFileSync(join(packed, f)))),
    ...ship.filter((f) => !readFileSync(join(ROOT, ZOD, f)).equals(readFileSync(join(packed, f)))),
  ];
  if (differ.length) fail("the tarball's files are not the assembled tree's, or not main's build's", differ);
  ok(`every file but package.json and the root entry is byte-identical to main's build`);
  const { added, removed, v4 } = await runtime(work, packed);

  const tgz = readFileSync(tarball);
  const toolchain = (name: string) =>
    JSON.parse(readFileSync(join(ROOT, "node_modules", name, "package.json"), "utf8")).version as string;
  const npm = execFileSync("npm", ["--version"], { encoding: "utf8" }).trim();
  const names = (list: string[]) => (list.length ? list.map((n) => `\`${n}\``).join(", ") : "none");
  const lines = [
    `## zod@${version}`,
    "",
    `- tarball: \`zod-${version}.tgz\`, integrity \`${integrity(tgz)}\`, sha256 \`${sha256(tgz)}\``,
    `- built from colinhacks/zod@${commit} by \`${ZOD}\`'s own \`nub run build\` (zshy ${toolchain("zshy")}, TypeScript ${toolchain("typescript")}), packed by npm ${npm} on Node ${process.version}`,
    `- \`zod\` and \`zod/v3\`: main's Zod 3 (\`${ZOD}/src/v3\`)`,
    `- \`zod/v4\`, \`zod/v4/core\`, \`zod/v4-mini\`, \`zod/v4/mini\`, \`zod/v4/locales\`, \`zod/v4/locales/*\`: main's Zod ${v4} (zod@${snapshot().version} carried Zod 4.0.0)`,
    `- \`exports\` has exactly zod@${snapshot().version}'s keys and conditions; every export name it had is still there but for the removals below`,
    `- left out of main's package: ${dropped.map((f) => `\`${f}\``).join(", ")}`,
    "",
    `### Export names added since ${snapshot().version}`,
    "",
    "| subpath | added (import and require) |",
    "| --- | --- |",
    ...added
      .filter((a) => snapshot().surface[a.subpath])
      .map((a) =>
        isDeepStrictEqual(a.import, a.require)
          ? `| \`${a.subpath}\` | ${names(a.import)} |`
          : `| \`${a.subpath}\` | import: ${names(a.import)}; require: ${names(a.require)} |`
      ),
    "",
    `New subpaths: ${names(added.filter((a) => !snapshot().surface[a.subpath]).map((a) => a.subpath))}`,
    "",
    `### Removed since ${snapshot().version}`,
    "",
    ...removed.flatMap((r) => [
      `- ${r.reason}; on ${names([...new Set(r.names.map((n) => n.split(" ")[0]))])}`,
      ...(r.detail ? [`  ${r.detail}`] : []),
    ]),
    "",
    `### Known differences from ${snapshot().version}`,
    "",
    "- every built `.cjs` seals its `exports` (#6564), so a CommonJS module object can no longer be extended or reassigned",
    "- `v3/locales/en.d.cts` and other default-only declarations are `export =` (zshy's CommonJS interop), so a consumer with both `skipLibCheck` and `esModuleInterop` (or `allowSyntheticDefaultImports`) off gets TS1259; set `skipLibCheck`, as #5160 says",
    "- Zod 4's declarations name the global `URL` (#6588), so a `zod/v4` consumer with `skipLibCheck` off needs the DOM lib or `@types/node`",
    "- each built directory carries main's stub `package.json`, so resolvers that ignore `exports` (TypeScript's `node10`, old bundlers) land on the CommonJS build and its `.d.cts`",
    "",
    "<details><summary>Every file (<code>shasum -a 256 -c</code> inside the unpacked <code>package/</code>)</summary>",
    "",
    "```",
    ...all.map((f) => `${sha256(readFileSync(join(packed, f)))}  ${f}`),
    "```",
    "",
    "</details>",
    "",
  ];
  const manifest = join(outDir, `zod-${version}.manifest.md`);
  writeFileSync(manifest, lines.join("\n"));
  rmSync(work, { recursive: true, force: true });
  console.log(`\n📦 ${tarball}\n   ${integrity(tgz)}\n📄 ${manifest}`);
}

async function verify(tarball: string, version: string) {
  checkVersion(version);
  const work = mkdtempSync(join(tmpdir(), "zod3-verify-"));
  verifyTree(unpack(resolve(tarball), join(work, "candidate")), version, committed());
  rmSync(work, { recursive: true, force: true });
}

// main's v3 suite, placed beside the built `v3/` so `zod/v3` and the suite's relative imports both land on the shipped JavaScript and declarations
async function suite(work: string, pkg: string) {
  const dir = join(work, "suite");
  const copy = join(dir, "pkg");
  cpSync(pkg, copy, { recursive: true });
  cpSync(join(copy, "src/v3/tests"), join(copy, "v3/tests"), { recursive: true });
  mkdirSync(join(dir, "node_modules"), { recursive: true });
  symlinkSync(copy, join(dir, "node_modules/zod"), "dir");
  symlinkSync(join(ROOT, "node_modules/vitest"), join(dir, "node_modules/vitest"), "dir");
  const fromVitest = createRequire(realpathSync(join(ROOT, "node_modules/vitest/package.json")));
  mkdirSync(join(dir, "node_modules/@types"));
  symlinkSync(dirname(fromVitest.resolve("@types/node/package.json")), join(dir, "node_modules/@types/node"), "dir");
  const config = join(dir, "vitest.config.mjs");
  writeFileSync(
    config,
    `export default ${JSON.stringify({
      resolve: { conditions: ["default"] },
      ssr: { resolve: { conditions: ["default"], externalConditions: ["default"] } },
      test: {
        include: ["pkg/v3/tests/**/*.test.ts"],
        setupFiles: [join(ROOT, "scripts/fail-on-console.ts")],
        watch: false,
        isolate: true,
        silent: true,
      },
    })};\n`
  );
  const vitest = join(ROOT, "node_modules/vitest/vitest.mjs");
  try {
    const { stdout } = await run(process.execPath, [vitest, "run", "--root", dir, "--config", config], {
      cwd: dir,
      env: plainEnv(),
    });
    const summary = stdout.split("\n").filter((l) => /^\s*(Test Files|Tests)\s/.test(l));
    ok(`main's v3 suite passes against the built JavaScript: ${summary.map((l) => l.trim()).join(", ")}`);
  } catch (e: any) {
    fail("main's v3 suite fails against the built JavaScript", [e.stdout ?? "", e.stderr ?? ""]);
  }

  // the suite's type tests against the shipped .d.ts graph; `paths` keeps `zod/v3` on the same declarations as the relative imports
  writeFileSync(
    join(copy, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "es2020",
        lib: ["es2020", "dom"],
        module: "nodenext",
        moduleResolution: "nodenext",
        strict: true,
        exactOptionalPropertyTypes: true,
        noImplicitReturns: true,
        noImplicitOverride: true,
        noUnusedParameters: true,
        esModuleInterop: true,
        isolatedModules: true,
        skipLibCheck: true,
        noEmit: true,
        types: ["node"],
        paths: { "zod/v3": ["./v3/index.d.ts"] },
      },
      include: ["v3/tests/**/*.ts"],
    })
  );
  try {
    await run(process.execPath, [join(ROOT, "node_modules/typescript/bin/tsc"), "-p", copy], { env: plainEnv() });
    ok("main's v3 type tests pass against the built declarations");
  } catch (e: any) {
    fail("main's v3 type tests fail against the built declarations", [e.stdout ?? "", e.stderr ?? ""]);
  }
}

// TypeScript versions from 4.5, the floor the v3 docs name, to 7
const TYPESCRIPT = ["4.5.5", "4.9.5", "5.0.4", "5.5.4", "5.9.3", "6.0.3", "7.0.2"];

// Zod 4's own floor; below it only the zod and zod/v3 fixture has to type-check
const V4_FLOOR = "5.5";

const ZOD3_IMPORTS = `import * as z3 from "zod";
import { z as zNamed } from "zod";
import zDefault from "zod";
import * as v3 from "zod/v3";
`;
const ZOD3_BODY = `const A = z3.object({ a: z3.string(), n: z3.number().optional() });
type A = z3.infer<typeof A>;
const a: A = { a: "x" };
const r = A.safeParse(a);
if (!r.success) r.error.format().a?._errors;
const m: z3.ZodErrorMap = z3.defaultErrorMap;
const B = zNamed.object({ b: zDefault.string() });
type B = zNamed.infer<typeof B>;
const C = v3.z.object({ c: v3.z.array(v3.z.string()) });
const fe: { c?: string[] } = C.safeParse({}).error!.flatten().fieldErrors;
type C = v3.infer<typeof C>;
export const zod3: [A, B, C, typeof r, typeof m, typeof fe] = null as any;
`;
const V4_IMPORTS = `import * as v4 from "zod/v4";
import * as core from "zod/v4/core";
import * as mini from "zod/v4-mini";
import * as mini2 from "zod/v4/mini";
import * as locales from "zod/v4/locales";
`;
const V4_BODY = `const D = v4.z.object({ d: v4.z.string() });
type D = v4.z.infer<typeof D>;
const E = mini.z.object({ e: mini.z.string() });
type E = mini.z.infer<typeof E>;
const F = mini2.object({ f: mini2.string() });
type F = core.output<typeof F>;
const loc: () => { localeError: core.$ZodErrorMap } = locales.en;
export const all: [D, E, F, typeof loc] = null as any;
`;

type Case = { ts: string; resolution: string; interop: boolean; fixture: "zod3" | "all" };

function cases(): Case[] {
  const out: Case[] = [];
  for (const ts of TYPESCRIPT) {
    const [major, minor] = ts.split(".").map(Number);
    const resolutions = [
      ...(major < 6 ? ["node10"] : []),
      ...(major > 4 || minor >= 7 ? ["node16", "nodenext"] : []),
      ...(major >= 5 ? ["bundler"] : []),
    ];
    for (const resolution of resolutions) {
      for (const interop of major >= 7 ? [true] : [true, false]) {
        for (const fixture of ["zod3", "all"] as const) out.push({ ts, resolution, interop, fixture });
      }
    }
  }
  return out;
}

// every locale file is imported by name too, so each `zod/v4/locales/*` subpath resolves its types
async function typecheck(dir: string, pkg: string, tsc: string, c: Case, locales: string[]): Promise<string> {
  const esm = c.resolution === "node16" || c.resolution === "nodenext";
  consumer(dir, pkg, esm || c.resolution === "bundler" ? "module" : "commonjs");
  const source = (ext: string) => {
    if (c.fixture === "zod3") return ZOD3_IMPORTS + ZOD3_BODY;
    const each = locales.map((l, i) => `import locale${i} from "zod/v4/locales/${l}${ext}";\n`).join("");
    const list = `export const each = [${locales.map((_, i) => `locale${i}()`).join(", ")}];\n`;
    return ZOD3_IMPORTS + V4_IMPORTS + each + ZOD3_BODY + V4_BODY + list;
  };
  const sources: Record<string, string> = esm
    ? { "esm.mts": source(".js"), "cjs.cts": source(".cjs") }
    : { "index.ts": source(".js") };
  for (const [file, text] of Object.entries(sources)) writeFileSync(join(dir, file), text);
  const [major] = c.ts.split(".").map(Number);
  const compilerOptions = {
    ...(esm
      ? { module: c.resolution, moduleResolution: c.resolution }
      : c.resolution === "bundler"
        ? { module: "esnext", moduleResolution: "bundler" }
        : { module: "commonjs", moduleResolution: "node" }),
    ...(major === 6 ? { ignoreDeprecations: "6.0" } : {}),
    target: "es2020",
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    esModuleInterop: c.interop,
    types: [],
  };
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions, files: Object.keys(sources) }));
  const output = await run(process.execPath, [tsc, "-p", "tsconfig.json"], { cwd: dir, env: plainEnv() }).then(
    (r) => r.stdout,
    (e) => `${e.stdout}${e.stderr}`
  );
  rmSync(dir, { recursive: true, force: true });
  return output.replaceAll(dir, "<consumer>").trim();
}

// zshy's `export =` declarations meet a default import only with esModuleInterop, which #5160 declined to work around
const isKnown = (c: Case, line: string) =>
  !c.interop && /error TS1259: Module '"[^"]*\/node_modules\/zod\/[^"]*"' can only be default-imported/.test(line);

async function typescript(work: string, pkg: string) {
  const tools = join(work, "typescript");
  mkdirSync(tools, { recursive: true });
  writeFileSync(join(tools, "package.json"), JSON.stringify({ private: true }));
  const specs = TYPESCRIPT.map((v) => `ts-${v}@npm:typescript@${v}`);
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent", ...specs], {
    cwd: tools,
    env: plainEnv(),
  });
  const locales = readdirSync(join(pkg, "v4/locales"))
    .filter((f) => f.endsWith(".js") && f !== "index.js")
    .map((f) => f.slice(0, -3))
    .sort();
  const all = cases();
  const results = await pool(all, async (c, i) => {
    const output = await typecheck(
      join(work, `ts-${i}`),
      pkg,
      join(tools, `node_modules/ts-${c.ts}/bin/tsc`),
      c,
      locales
    );
    const errors = output.split("\n").filter((l) => /error TS\d+/.test(l));
    const below = c.ts.localeCompare(V4_FLOOR, undefined, { numeric: true }) < 0;
    const unsupported = below && c.fixture === "all";
    return { ...c, output, errors, known: errors.filter((l) => isKnown(c, l)), unsupported };
  });
  const label = (r: Case) =>
    `TypeScript ${r.ts} ${r.resolution}${r.interop ? "" : " without esModuleInterop"} (${r.fixture === "zod3" ? "zod, zod/v3" : "every subpath"})`;
  const failed = results.filter((r) => !r.unsupported && r.errors.length > r.known.length);
  if (failed.length) {
    fail(
      "consumers have type errors",
      failed.map((r) => `${label(r)}:\n${r.errors.filter((l) => !isKnown(r, l)).join("\n")}`)
    );
  }
  const clean = results.filter((r) => !r.errors.length).length;
  const known = results.filter((r) => r.known.length && r.known.length === r.errors.length);
  const unsupported = results.filter((r) => r.unsupported && r.errors.length);
  ok(
    `${results.length} TypeScript consumer checks (${TYPESCRIPT.join(", ")}; node10, node16, nodenext, bundler; ESM and CJS; ${locales.length} locale subpaths by name): ${clean} error-free, ${known.length} with only the known TS1259, ${unsupported.length} below Zod 4's TypeScript ${V4_FLOOR} floor`
  );
  for (const r of known) console.log(`   known TS1259: ${label(r)}`);
  for (const r of unsupported) console.log(`   below ${V4_FLOOR}: ${label(r)}, ${r.errors.length} errors`);
}

async function smoke(tarball: string) {
  const work = mkdtempSync(join(tmpdir(), "zod3-smoke-"));
  const pkg = unpack(resolve(tarball), join(work, "candidate"));
  const { added, v4 } = await runtime(work, pkg);
  ok(`zod/v4 is Zod ${v4}; ${added.length} subpaths add export names (listed in the manifest)`);
  await suite(work, pkg);
  await typescript(work, pkg);
  rmSync(work, { recursive: true, force: true });
}

// the one time 3.25.76 is downloaded: its package.json and export names, recorded for every later check
async function recordSnapshot(tarball: string) {
  const tgz = readFileSync(resolve(tarball));
  if (integrity(tgz) !== BASE_INTEGRITY) fail(`${tarball} is not zod@3.25.76`, [`got ${integrity(tgz)}`]);
  const work = mkdtempSync(join(tmpdir(), "zod3-snapshot-"));
  const pkg = unpack(resolve(tarball), join(work, "base"));
  const { surface } = await probe(join(work, "probe"), pkg);
  const packageJson = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
  const out: Snapshot = { version: packageJson.version, integrity: BASE_INTEGRITY, packageJson, surface };
  writeFileSync(SNAPSHOT, `${JSON.stringify(out, null, 2)}\n`);
  rmSync(work, { recursive: true, force: true });
  ok(
    `recorded zod@${out.version}'s package.json and ${Object.keys(surface).length} subpaths in ${relative(ROOT, SNAPSHOT)}`
  );
}

const [command, ...args] = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};

try {
  if (command === "build") {
    const out = resolve(flag("--out") ?? join(ROOT, "tmp/zod3-release"));
    await build(args[0], out);
  } else if (command === "verify") await verify(args[0], args[1]);
  else if (command === "smoke") await smoke(args[0]);
  else if (command === "snapshot") await recordSnapshot(args[0]);
  else {
    fail(
      "usage: nub scripts/zod3-release.ts build <version> [--out <dir>] | verify <tarball> <version> | smoke <tarball> | snapshot <zod-3.25.76.tgz>"
    );
  }
} catch (e) {
  if (!(e instanceof Failure)) throw e;
  console.error(`❌ ${e.message}`);
  for (const d of e.details) console.error(`   ${d}`);
  process.exit(1);
}
