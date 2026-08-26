import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import * as valita from "@badrap/valita";
import { type } from "arktype";
import Ajv from "ajv";
import myzod from "myzod";
import * as v from "valibot";
import * as z from "zod";

// Cross-library parse throughput on the fixture from moltar/typescript-runtime-type-benchmarks.
//
// Methodology is the one in compile-matrix.ts, for the same reasons: absolute ops/sec drifts by tens of percent between runs, so every library is measured *interleaved* inside one round and the best of N rounds is kept. Two things distort a cross-library number if left alone — a result nobody reads is deleted by V8, and an input passed as a constant makes the call loop-invariant — so results escape into a sink and inputs arrive through an array load.
//
// Libraries do different amounts of work at their idiomatic default, and this table does not pretend otherwise. `kind` records what each entry actually does: "parse" returns a value, "validate" only answers yes or no. The two are not comparable, so they are reported separately.

const DATA = Object.freeze({
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: "string",
  longString:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  boolean: true,
  deeplyNested: { foo: "bar", num: 1, bool: false },
});

type Kind = "parse" | "validate";

interface Entry {
  name: string;
  kind: Kind;
  run: (input: unknown) => unknown;
}

const entries: Entry[] = [];
const add = (name: string, kind: Kind, run: (input: unknown) => unknown) => entries.push({ name, kind, run });

// --- zod ---
const zodSchema = z.object({
  number: z.number(),
  negNumber: z.number(),
  maxNumber: z.number(),
  string: z.string(),
  longString: z.string(),
  boolean: z.boolean(),
  deeplyNested: z.object({ foo: z.string(), num: z.number(), bool: z.boolean() }),
});
const zodCompiled = z.compile(zodSchema);
add("zod (compiled)", "parse", (d) => zodCompiled.parse(d));
add("zod", "parse", (d) => zodSchema.parse(d));

// --- valibot ---
const valibotSchema = v.object({
  number: v.number(),
  negNumber: v.number(),
  maxNumber: v.number(),
  string: v.string(),
  longString: v.string(),
  boolean: v.boolean(),
  deeplyNested: v.object({ foo: v.string(), num: v.number(), bool: v.boolean() }),
});
add("valibot", "parse", (d) => v.parse(valibotSchema, d));

// --- arktype ---
const arktypeSchema = type({
  number: "number",
  negNumber: "number",
  maxNumber: "number",
  string: "string",
  longString: "string",
  boolean: "boolean",
  deeplyNested: { foo: "string", num: "number", bool: "boolean" },
});
add("arktype", "parse", (d) => arktypeSchema(d));

// --- valita ---
const valitaSchema = valita.object({
  number: valita.number(),
  negNumber: valita.number(),
  maxNumber: valita.number(),
  string: valita.string(),
  longString: valita.string(),
  boolean: valita.boolean(),
  deeplyNested: valita.object({ foo: valita.string(), num: valita.number(), bool: valita.boolean() }),
});
add("valita", "parse", (d) => valitaSchema.parse(d));

// --- myzod ---
const myzodSchema = myzod.object({
  number: myzod.number(),
  negNumber: myzod.number(),
  maxNumber: myzod.number(),
  string: myzod.string(),
  longString: myzod.string(),
  boolean: myzod.boolean(),
  deeplyNested: myzod.object({ foo: myzod.string(), num: myzod.number(), bool: myzod.boolean() }),
});
add("myzod", "parse", (d) => myzodSchema.parse(d));

// --- typebox, via its AOT compiler ---
const typeboxSchema = Type.Object({
  number: Type.Number(),
  negNumber: Type.Number(),
  maxNumber: Type.Number(),
  string: Type.String(),
  longString: Type.String(),
  boolean: Type.Boolean(),
  deeplyNested: Type.Object({ foo: Type.String(), num: Type.Number(), bool: Type.Boolean() }),
});
const typeboxCompiled = TypeCompiler.Compile(typeboxSchema);
add("typebox (compiled)", "validate", (d) => typeboxCompiled.Check(d));

// --- ajv, also AOT ---
const ajvValidate = new Ajv({ allErrors: false }).compile({
  type: "object",
  properties: {
    number: { type: "number" },
    negNumber: { type: "number" },
    maxNumber: { type: "number" },
    string: { type: "string" },
    longString: { type: "string" },
    boolean: { type: "boolean" },
    deeplyNested: {
      type: "object",
      properties: { foo: { type: "string" }, num: { type: "number" }, bool: { type: "boolean" } },
      required: ["foo", "num", "bool"],
    },
  },
  required: ["number", "negNumber", "maxNumber", "string", "longString", "boolean", "deeplyNested"],
});
add("ajv (compiled)", "validate", (d) => ajvValidate(d));

// ---------------------------------------------------------------------------

function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEq((a as any)[k], (b as any)[k]));
}

const ROUNDS = 15;

function timed(fn: () => void, iters: number): number {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  return Number(process.hrtime.bigint() - start) / 1e6;
}

/** iterations that put one measurement near ~40ms, so a round is short but not noise */
function calibrate(fn: () => void): number {
  let iters = 64;
  for (;;) {
    const ms = timed(fn, iters);
    if (ms > 25 || iters > 4_000_000) return iters;
    iters = Math.max(iters * 2, Math.ceil((iters * 40) / Math.max(ms, 0.05)));
  }
}

// consumed at the end so V8 cannot delete the parse, and escaped so the result is not stack-allocated
let sink = 0;
let escaped: unknown;

const problems: string[] = [];
const runners: { entry: Entry; fn: () => void }[] = [];

for (const e of entries) {
  // an array load, not a constant, or the whole call is loop-invariant and gets hoisted out of the timing loop; distinct objects also stop a library that returns its input from escaping the same reference every iteration
  const pool = Array.from({ length: 64 }, (_, i) => ({ ...DATA, number: i, deeplyNested: { ...DATA.deeplyNested } }));
  let idx = 0;

  // correctness gate: a library that returns the wrong thing is not being measured on the same work
  let out: unknown;
  try {
    out = e.run(DATA);
  } catch (err) {
    problems.push(`${e.name}: threw on the fixture (${(err as Error).message})`);
    continue;
  }
  if (e.kind === "validate") {
    if (out !== true) {
      problems.push(`${e.name}: did not accept the fixture`);
      continue;
    }
  } else if (!deepEq(out, DATA)) {
    problems.push(`${e.name}: parsed output differs from the input`);
    continue;
  }

  runners.push({
    entry: e,
    fn: () => {
      const r = e.run(pool[idx++ & 63]);
      sink += r ? 1 : 0;
      escaped = r;
    },
  });
}

for (const r of runners) r.fn();
const iters = new Map(runners.map((r) => [r.entry.name, calibrate(r.fn)]));
const best = new Map(runners.map((r) => [r.entry.name, Number.POSITIVE_INFINITY]));

for (let round = 0; round < ROUNDS; round++) {
  for (const r of runners) {
    const n = iters.get(r.entry.name)!;
    const ms = timed(r.fn, n);
    const ops = (n / ms) * 1000;
    if (ms < best.get(r.entry.name)!) best.set(r.entry.name, ms);
    void ops;
  }
}

const rows = runners
  .map((r) => ({
    name: r.entry.name,
    kind: r.entry.kind,
    ops: (iters.get(r.entry.name)! / best.get(r.entry.name)!) * 1000,
  }))
  .sort((a, b) => b.ops - a.ops);

const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : n.toFixed(0));

console.log();
console.log(`moltar fixture — best of ${ROUNDS} interleaved rounds, ops/sec`);
console.log();
for (const kind of ["parse", "validate"] as const) {
  const group = rows.filter((r) => r.kind === kind);
  if (!group.length) continue;
  console.log(kind === "parse" ? "returns a parsed value:" : "validates only, returns a boolean:");
  const top = group[0].ops;
  for (const r of group) {
    console.log(`  ${r.name.padEnd(20)}${fmt(r.ops).padStart(9)}  ${(r.ops / top).toFixed(2)}x`);
  }
  console.log();
}
if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log(`  ${p}`);
  console.log();
}
console.log(JSON.stringify({ rows }));
console.log(`checksum ${sink} ${escaped ? "" : "-"}`);

// guard: the zod row must actually be running generated code, not silently falling back to the standard parser
import { INVALID, compileFastpass } from "zod/v4/core";
if (compileFastpass(zodSchema)(DATA) === INVALID) {
  console.log("PROBLEM: the zod fast path rejected the fixture, so the compiled row is measuring the fallback");
}
