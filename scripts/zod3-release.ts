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
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { isDeepStrictEqual, promisify } from "node:util";
import type TS from "typescript";

// the zod@3.25.N tarball `.github/workflows/release-v3.yml` stages: zod@3.25.76 with only its Zod 3 API (`v3/**`, `src/v3/**`) taken from main, so `zod/v4*` stays 3.25.76's byte for byte
//
// - `build <version> [--out <dir>]` assembles, verifies and packs, writing `zod-<version>.tgz` and `zod-<version>.manifest.md`
// - `verify <tarball> <version>` re-checks a packed tarball against zod@3.25.76 and main's `src/v3`, with node built-ins only
// - `smoke <tarball>` requires and imports every subpath, runs main's v3 suite against the built files, and type-checks consumers on TypeScript 4.5 to 7

const BASE_VERSION = "3.25.76";
const BASE_INTEGRITY =
  "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==";
const BASE_TARBALL = `https://registry.npmjs.org/zod/-/zod-${BASE_VERSION}.tgz`;

const ROOT = resolve(import.meta.dirname, "..");
const MAIN_V3 = "packages/zod/src/v3";
const isZod3 = (file: string) => file.startsWith("v3/") || file.startsWith("src/v3/");

// the root index re-exports v3; main has no such file, so it stays 3.25.76's and the build only proves it unchanged
const ROOT_INDEX = ["index.cjs", "index.d.cts", "index.d.ts", "index.js"];

// 3.25.76's build options at 50606616 with zshy 0.0.12's overrides, less its es6 `lib` and `customConditions`, which only failed the type check; the rebuild of 3.25.76 proves the emit unchanged
const TSCONFIG = {
  target: "es2020",
  lib: ["es2020", "dom"],
  module: "NodeNext",
  moduleResolution: "NodeNext",
  jsx: "react",
  strict: true,
  alwaysStrict: true,
  noUncheckedIndexedAccess: false,
  exactOptionalPropertyTypes: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noImplicitAny: true,
  noImplicitReturns: true,
  noImplicitThis: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
  resolveJsonModule: true,
  removeComments: false,
  esModuleInterop: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  downlevelIteration: true,
  isolatedModules: true,
  types: [],
  declaration: true,
  noEmit: false,
  emitDeclarationOnly: false,
  verbatimModuleSyntax: false,
};

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

// `3.25.N` above 76: the 3.x line takes patches only, and its `zod/v4*` must stay 3.25.76's
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

async function fetchBase(work: string): Promise<string> {
  const res = await fetch(BASE_TARBALL);
  if (!res.ok) fail(`${BASE_TARBALL}: HTTP ${res.status}`);
  const tgz = Buffer.from(await res.arrayBuffer());
  const got = integrity(tgz);
  if (got !== BASE_INTEGRITY) fail(`zod@${BASE_VERSION} does not match its pinned integrity`, [`got ${got}`]);
  ok(`zod@${BASE_VERSION} matches its pinned integrity ${BASE_INTEGRITY.slice(0, 22)}…`);
  const file = join(work, `zod-${BASE_VERSION}.tgz`);
  writeFileSync(file, tgz);
  return unpack(file, join(work, "base"));
}

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

// the committed Zod 3 source of the checkout; a dirty src/v3 would ship bytes no commit holds
function mainSource(): Map<string, Buffer> {
  const dirty = git("status", "--porcelain", "--", MAIN_V3);
  if (dirty) fail(`${MAIN_V3} has uncommitted changes`, dirty.split("\n"));
  const out = new Map<string, Buffer>();
  for (const file of git("ls-files", "-z", "--", MAIN_V3).split("\0").filter(Boolean)) {
    out.set(`src/v3/${file.slice(MAIN_V3.length + 1)}`, readFileSync(join(ROOT, file)));
  }
  return out;
}

// zshy 0.0.12's extension rewrite: `./x.js` and extensionless relative specifiers take the output extension
function rewriter(ts: typeof TS, ext: string): TS.TransformerFactory<any> {
  const swap = (text: string) => {
    if (text.endsWith(".js")) return text.slice(0, -3) + ext;
    if ((text.startsWith("./") || text.startsWith("../")) && extname(text) === "") return text + ext;
    return undefined;
  };
  return (context) => (sourceFile) => {
    const visit = (node: TS.Node): TS.Node => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const text = swap(node.moduleSpecifier.text);
        if (text !== undefined) {
          const spec = ts.factory.createStringLiteral(text);
          return ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, spec, node.attributes);
        }
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const text = swap(node.moduleSpecifier.text);
        if (text !== undefined) {
          const spec = ts.factory.createStringLiteral(text);
          return ts.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            spec,
            node.attributes
          );
        }
      }
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0];
        const text = arg && ts.isStringLiteral(arg) ? swap(arg.text) : undefined;
        if (text !== undefined) {
          const args = [ts.factory.createStringLiteral(text), ...node.arguments.slice(1)];
          return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, args);
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return ts.visitNode(sourceFile, visit);
  };
}

// compiles `<src>/index.ts` and `<src>/v3/index.ts` the way zshy 0.0.12 built 3.25.76: one CJS and one ESM program, renamed to .cjs/.d.cts and .js/.d.ts
async function compile(src: string): Promise<Map<string, string>> {
  const { default: ts } = await import("typescript");
  const parsed = ts.convertCompilerOptionsFromJson(TSCONFIG, src);
  const host0 = { getCanonicalFileName: (f: string) => f, getCurrentDirectory: () => src, getNewLine: () => "\n" };
  if (parsed.errors.length) fail("the build options do not parse", [ts.formatDiagnostics(parsed.errors, host0)]);
  const outDir = join(src, "..", "out");
  const out = new Map<string, string>();
  const formats = [
    { module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.Node10, js: ".cjs", dts: ".d.cts" },
    { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, js: ".js", dts: ".d.ts" },
  ];
  for (const { module, moduleResolution, js, dts } of formats) {
    const options = { ...parsed.options, rootDir: src, outDir, module, moduleResolution };
    const host = ts.createCompilerHost(options);
    host.writeFile = (name, data) => {
      const file = relative(outDir, name).split(sep).join("/");
      out.set(
        file.endsWith(".d.ts") ? file.slice(0, -5) + dts : file.endsWith(".js") ? file.slice(0, -3) + js : file,
        data
      );
    };
    const program = ts.createProgram({ rootNames: [join(src, "index.ts"), join(src, "v3/index.ts")], options, host });
    const outside = program
      .getSourceFiles()
      .filter((f) => !f.isDeclarationFile && relative(src, f.fileName).startsWith(".."));
    if (outside.length) {
      fail(
        "the Zod 3 build reaches outside src/v3",
        outside.map((f) => f.fileName)
      );
    }
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) fail(`the ${js} build has type errors`, [ts.formatDiagnostics(diagnostics, host0)]);
    const rewrite = rewriter(ts, js);
    const emitted = program.emit(undefined, undefined, undefined, undefined, {
      before: [rewrite],
      afterDeclarations: [rewrite],
    });
    if (emitted.emitSkipped || emitted.diagnostics.length) {
      fail(`the ${js} emit failed`, [ts.formatDiagnostics(emitted.diagnostics, host0)]);
    }
  }
  return out;
}

function sourceTree(dir: string, index: Buffer, v3: Map<string, Buffer>): string {
  for (const [file, data] of [["src/index.ts", index] as const, ...v3]) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), data);
  }
  return join(dir, "src");
}

// the version line is the only one that changes, so the file keeps 3.25.76's formatting
function packageJson(base: string, version: string): string {
  const parts = base.split(`"version": "${BASE_VERSION}"`);
  if (parts.length !== 2) fail(`zod@${BASE_VERSION}'s package.json does not carry exactly one version line`);
  return parts.join(`"version": "${version}"`);
}

type Report = { identical: number; changed: string[]; unchanged: number };

// the release's invariants, on an unpacked tree: 3.25.76's file set, its bytes outside the Zod 3 parts, its package.json but for the version, and main's committed src/v3
function verifyTree(pkg: string, base: string, version: string, v3: Map<string, Buffer>): Report {
  const have = files(pkg);
  const want = files(base);
  const added = have.filter((f) => !want.includes(f));
  const removed = want.filter((f) => !have.includes(f));
  if (added.length || removed.length) {
    fail(`the file set differs from zod@${BASE_VERSION}'s`, [
      ...added.map((f) => `+ ${f}`),
      ...removed.map((f) => `- ${f}`),
    ]);
  }
  ok(`file set is exactly zod@${BASE_VERSION}'s (${have.length} files)`);

  const report: Report = { identical: 0, changed: [], unchanged: 0 };
  const mismatched: string[] = [];
  for (const file of have) {
    const data = readFileSync(join(pkg, file));
    const old = readFileSync(join(base, file));
    if (isZod3(file)) {
      if (data.equals(old)) report.unchanged++;
      else report.changed.push(file);
    } else if (file === "package.json") {
      const got = JSON.parse(data.toString("utf8"));
      const expected = { ...JSON.parse(old.toString("utf8")), version };
      if (!isDeepStrictEqual(got, expected) || data.toString("utf8") !== packageJson(old.toString("utf8"), version)) {
        mismatched.push(`${file} (must be ${BASE_VERSION}'s with only "version" changed to ${version})`);
      }
    } else if (data.equals(old)) report.identical++;
    else mismatched.push(file);
  }
  if (mismatched.length) fail(`files outside the Zod 3 API differ from zod@${BASE_VERSION}`, mismatched);
  ok(`${report.identical} files outside the Zod 3 API are byte-identical to zod@${BASE_VERSION}`);
  ok(`package.json is zod@${BASE_VERSION}'s with only "version" changed to ${version}`);

  const source = have.filter((f) => f.startsWith("src/v3/"));
  const stray = [
    ...source.filter((f) => !v3.get(f)?.equals(readFileSync(join(pkg, f)))),
    ...[...v3.keys()].filter((f) => !source.includes(f)),
  ];
  if (stray.length) fail(`src/v3 is not main's committed ${MAIN_V3}`, stray);
  ok(`src/v3 is main's committed ${MAIN_V3} (${source.length} files)`);

  // the .d.ts and .d.cts twins differ only in their specifiers, so type-checking one graph covers both
  const twins = have
    .filter((f) => f.startsWith("v3/") && f.endsWith(".d.ts"))
    .filter((f) => {
      const cts = readFileSync(join(pkg, `${f.slice(0, -5)}.d.cts`), "utf8").replaceAll('.cjs"', '.js"');
      return cts !== readFileSync(join(pkg, f), "utf8");
    });
  if (twins.length) fail("v3 .d.cts files differ from their .d.ts twins beyond import specifiers", twins);
  return report;
}

async function build(version: string, outDir: string) {
  checkVersion(version);
  const work = mkdtempSync(join(tmpdir(), "zod3-build-"));
  const base = await fetchBase(work);
  const v3 = mainSource();
  const commit = git("rev-parse", "HEAD");
  const { default: ts } = await import("typescript");

  // the toolchain has to rebuild 3.25.76's own source into 3.25.76's own files before it is trusted with main's
  const index = readFileSync(join(base, "src/index.ts"));
  const baseV3 = new Map(
    files(join(base, "src/v3")).map((f) => [`src/v3/${f}`, readFileSync(join(base, "src/v3", f))] as const)
  );
  const oracle = await compile(sourceTree(join(work, "oracle"), index, baseV3));
  const expected = files(base).filter((f) => f.startsWith("v3/") || ROOT_INDEX.includes(f));
  const off = [
    ...expected.filter((f) => oracle.get(f) !== readFileSync(join(base, f), "utf8")),
    ...[...oracle.keys()].filter((f) => !expected.includes(f)),
  ];
  if (off.length) fail(`TypeScript ${ts.version} does not rebuild zod@${BASE_VERSION}'s own v3 files`, off);
  ok(`TypeScript ${ts.version} rebuilds zod@${BASE_VERSION}'s ${oracle.size} v3 and root index files byte for byte`);

  const built = await compile(sourceTree(join(work, "main"), index, v3));
  const shape = [
    ...[...oracle.keys()].filter((f) => !built.has(f)).map((f) => `- ${f}`),
    ...[...built.keys()].filter((f) => !oracle.has(f)).map((f) => `+ ${f}`),
    ...ROOT_INDEX.filter((f) => built.get(f) !== oracle.get(f)).map((f) => `~ ${f}`),
  ];
  if (shape.length) fail(`main's Zod 3 build does not have zod@${BASE_VERSION}'s shape`, shape);
  ok(`built main's ${MAIN_V3} at ${commit.slice(0, 12)}`);

  const pkg = join(work, "package");
  cpSync(base, pkg, { recursive: true });
  rmSync(join(pkg, "v3"), { recursive: true });
  rmSync(join(pkg, "src/v3"), { recursive: true });
  for (const [file, data] of [...[...built].filter(([f]) => f.startsWith("v3/")), ...v3]) {
    mkdirSync(join(pkg, file, ".."), { recursive: true });
    writeFileSync(join(pkg, file), data);
  }
  writeFileSync(join(pkg, "package.json"), packageJson(readFileSync(join(base, "package.json"), "utf8"), version));
  verifyTree(pkg, base, version, v3);

  mkdirSync(outDir, { recursive: true });
  const tarball = join(outDir, `zod-${version}.tgz`);
  rmSync(tarball, { force: true });
  execFileSync("npm", ["pack", "--ignore-scripts", "--silent", "--pack-destination", outDir], { cwd: pkg });
  if (!existsSync(tarball)) fail(`npm pack did not write ${tarball}`);

  // what ships is the tarball, so the checks run again on it, and its bytes must be the tree's
  console.log(`\nzod-${version}.tgz:`);
  const packed = unpack(tarball, join(work, "packed"));
  const report = verifyTree(packed, base, version, v3);
  const drift = files(pkg).filter((f) => !readFileSync(join(pkg, f)).equals(readFileSync(join(packed, f))));
  if (drift.length) fail("npm pack changed files", drift);
  for (const [file, data] of built) {
    if (file.startsWith("v3/") && readFileSync(join(packed, file), "utf8") !== data) fail(`${file} is not the build's`);
  }

  const tgz = readFileSync(tarball);
  const lines = [
    `## zod@${version}`,
    "",
    `- tarball: \`zod-${version}.tgz\`, integrity \`${integrity(tgz)}\`, sha256 \`${sha256(tgz)}\``,
    `- base: \`zod@${BASE_VERSION}\` (\`${BASE_INTEGRITY}\`)`,
    `- Zod 3 source: \`${MAIN_V3}\` at colinhacks/zod@${commit}, built with TypeScript ${ts.version} the way zshy 0.0.12 built ${BASE_VERSION}`,
    `- packed by npm ${execFileSync("npm", ["--version"], { encoding: "utf8" }).trim()} on Node ${process.version}; with that npm, \`nub scripts/zod3-release.ts build ${version}\` at that commit reproduces the tarball`,
    `- ${report.identical} files outside \`v3/\` and \`src/v3/\` are byte-identical to ${BASE_VERSION}; \`package.json\` changes only \`version\``,
    "",
    `### Files that differ from ${BASE_VERSION}`,
    "",
    "| file | sha256 |",
    "| --- | --- |",
    ...report.changed.map((f) => `| \`${f}\` | \`${sha256(readFileSync(join(packed, f)))}\` |`),
    `| \`package.json\` | \`${sha256(readFileSync(join(packed, "package.json")))}\` |`,
    "",
    "<details><summary>Every file (<code>shasum -a 256 -c</code> inside the unpacked <code>package/</code>)</summary>",
    "",
    "```",
    ...files(packed).map((f) => `${sha256(readFileSync(join(packed, f)))}  ${f}`),
    "```",
    "",
    "</details>",
    "",
  ];
  const manifest = join(outDir, `zod-${version}.manifest.md`);
  writeFileSync(manifest, lines.join("\n"));
  rmSync(work, { recursive: true, force: true });
  ok(`${report.changed.length} Zod 3 files changed, ${report.unchanged} unchanged`);
  console.log(`\n📦 ${tarball}\n   ${integrity(tgz)}\n📄 ${manifest}`);
}

async function verify(tarball: string, version: string) {
  checkVersion(version);
  const work = mkdtempSync(join(tmpdir(), "zod3-verify-"));
  const base = await fetchBase(work);
  const pkg = unpack(resolve(tarball), join(work, "candidate"));
  const report = verifyTree(pkg, base, version, mainSource());
  ok(`${report.changed.length} Zod 3 files changed, ${report.unchanged} unchanged`);
  rmSync(work, { recursive: true, force: true });
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
console.log(JSON.stringify({ specs: specs.length, surface, parses }));
`;

async function probe(dir: string, pkg: string) {
  consumer(dir, pkg, "module");
  writeFileSync(join(dir, "probe.mjs"), PROBE);
  const { stdout } = await run(process.execPath, ["probe.mjs"], { cwd: dir, env: plainEnv() }).catch((e) =>
    fail(`the runtime probe fails in ${dir}`, [e.stderr ?? String(e)])
  );
  return JSON.parse(stdout) as { specs: number; surface: Record<string, unknown>; parses: string[][] };
}

async function runtime(work: string, pkg: string, base: string) {
  const [got, want] = await Promise.all([probe(join(work, "rt-candidate"), pkg), probe(join(work, "rt-base"), base)]);
  const diff = Object.keys({ ...want.surface, ...got.surface }).filter(
    (s) => !isDeepStrictEqual(got.surface[s], want.surface[s])
  );
  if (diff.length) fail(`the exports differ from zod@${BASE_VERSION}'s`, diff);
  ok(`require() and import() of all ${got.specs} subpaths expose zod@${BASE_VERSION}'s exact export names`);
  const parsed = got.parses.filter((p) => p[1] === '{"name":"a","tags":["x"]}' && /invalid_type/.test(p[2]));
  if (parsed.length !== got.parses.length || !isDeepStrictEqual(got.parses, want.parses)) {
    fail(
      "a parse through the built package misbehaves",
      got.parses.map((p) => p.join(" → "))
    );
  }
  ok(`parses through zod, zod/v3 and zod/v4 (ESM and CJS) match zod@${BASE_VERSION}`);
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

// TypeScript versions from 4.5, the floor the v3 docs name, to 7; each candidate result must equal zod@3.25.76's
const TYPESCRIPT = ["4.5.5", "4.9.5", "5.0.4", "5.5.4", "5.9.3", "6.0.3", "7.0.2"];

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
const ALL_IMPORTS = (locale: string) => `import * as v4 from "zod/v4";
import * as core from "zod/v4/core";
import * as mini from "zod/v4-mini";
import * as mini2 from "zod/v4/mini";
import * as locales from "zod/v4/locales";
import en from "zod/v4/locales/${locale}";
`;
const ALL_BODY = `const D = v4.z.object({ d: v4.z.string() });
type D = v4.z.infer<typeof D>;
const E = mini.z.object({ e: mini.z.string() });
type E = mini.z.infer<typeof E>;
const F = mini2.object({ f: mini2.string() });
type F = core.output<typeof F>;
const loc: () => { localeError: core.$ZodErrorMap } = locales.en;
const loc2: () => { localeError: core.$ZodErrorMap } = en;
export const all: [D, E, F, typeof loc, typeof loc2] = null as any;
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

async function typecheck(dir: string, pkg: string, tsc: string, c: Case): Promise<string> {
  const esm = c.resolution === "node16" || c.resolution === "nodenext";
  consumer(dir, pkg, esm || c.resolution === "bundler" ? "module" : "commonjs");
  const source = (locale: string) =>
    c.fixture === "zod3" ? ZOD3_IMPORTS + ZOD3_BODY : ZOD3_IMPORTS + ALL_IMPORTS(locale) + ZOD3_BODY + ALL_BODY;
  const sources: Record<string, string> = esm
    ? { "esm.mts": source("en.js"), "cjs.cts": source("en.cjs") }
    : { "index.ts": source("en.js") };
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
    lib: ["es2020"],
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

async function typescript(work: string, pkg: string, base: string) {
  const tools = join(work, "typescript");
  mkdirSync(tools, { recursive: true });
  writeFileSync(join(tools, "package.json"), JSON.stringify({ private: true }));
  const specs = TYPESCRIPT.map((v) => `ts-${v}@npm:typescript@${v}`);
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent", ...specs], {
    cwd: tools,
    env: plainEnv(),
  });
  const all = cases();
  const results = await pool(all, async (c, i) => {
    const tsc = join(tools, `node_modules/ts-${c.ts}/bin/tsc`);
    const [got, want] = await Promise.all([
      typecheck(join(work, `ts-${i}-candidate`), pkg, tsc, c),
      typecheck(join(work, `ts-${i}-base`), base, tsc, c),
    ]);
    return { ...c, got, want, errors: (got.match(/error TS\d+/g) ?? []).length };
  });
  const regressions = results.filter((r) => r.got !== r.want);
  const label = (r: Case) =>
    `TypeScript ${r.ts} ${r.resolution}${r.interop ? "" : " without esModuleInterop"} (${r.fixture})`;
  if (regressions.length) {
    fail(
      `consumers type-check differently from zod@${BASE_VERSION}`,
      regressions.map((r) => `${label(r)}:\n--- ${BASE_VERSION}\n${r.want}\n--- candidate\n${r.got}`)
    );
  }
  const supported = (r: Case) => r.ts.localeCompare("5.5", undefined, { numeric: true }) >= 0;
  const broken = results.filter((r) => supported(r) && r.interop && r.errors > 0);
  if (broken.length) fail("a consumer on TypeScript 5.5 or later has type errors", broken.map(label));
  const clean = results.filter((r) => r.errors === 0).length;
  ok(
    `${results.length} TypeScript consumer checks (${TYPESCRIPT.join(", ")}; node10, node16, nodenext, bundler; ESM and CJS) match zod@${BASE_VERSION} exactly, ${clean} of them error-free`
  );
  for (const r of results.filter((r) => r.errors > 0)) {
    console.log(`   ${label(r)}: ${r.errors} errors, as in ${BASE_VERSION}`);
  }
}

async function smoke(tarball: string) {
  const work = mkdtempSync(join(tmpdir(), "zod3-smoke-"));
  const base = await fetchBase(work);
  const pkg = unpack(resolve(tarball), join(work, "candidate"));
  await runtime(work, pkg, base);
  await suite(work, pkg);
  await typescript(work, pkg, base);
  rmSync(work, { recursive: true, force: true });
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
  else {
    fail(
      "usage: nub scripts/zod3-release.ts build <version> [--out <dir>] | verify <tarball> <version> | smoke <tarball>"
    );
  }
} catch (e) {
  if (!(e instanceof Failure)) throw e;
  console.error(`❌ ${e.message}`);
  for (const d of e.details) console.error(`   ${d}`);
  process.exit(1);
}
