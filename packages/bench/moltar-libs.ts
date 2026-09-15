import { createRequire } from "node:module";
import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import { type } from "arktype";
import { Schema } from "effect";
import * as v from "valibot";
import * as yup from "yup";
import * as z from "zod";
import { INVALID, compileFn } from "zod/v4/core";
import * as z3 from "zod3";

// Cross-library throughput on the fixture and the categories from moltar/typescript-runtime-type-benchmarks.
//
// The categories are not interchangeable, and mixing them is the easy way to publish a wrong number. `parseSafe` must return a NEW object with unknown keys removed, at every level. `assertLoose` only answers yes or no and may ignore unknown keys entirely, so it never allocates. Upstream, zod enters both; arktype enters assertLoose only. Comparing zod's parseSafe against arktype's assertLoose measures the allocation, not the validator, so each group here is reported on its own and every entry is held to its category's contract before it is timed.
//
// Timing methodology is compile-matrix.ts's, for the same reasons: absolute ops/sec drifts by tens of percent between runs, so entries are measured interleaved inside one round and the best of N rounds is kept. Results escape into a sink or V8 deletes the call, and inputs arrive through an array load or the call is loop-invariant and gets hoisted out of the loop.

const DATA = Object.freeze({
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: "string",
  longString:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  boolean: true,
  deeplyNested: { foo: "bar", num: 1, bool: false },
});

/** what moltar's parseSafe feeds in: the fixture plus unknown keys the parser must strip, nested ones included */
const DIRTY = Object.freeze({
  ...DATA,
  extraAttribute: "strip me",
  deeplyNested: { ...DATA.deeplyNested, extraNestedAttribute: "strip me" },
});

type Category = "parseSafe" | "assertLoose";

interface Entry {
  name: string;
  category: Category;
  run: (input: unknown) => unknown;
}

const entries: Entry[] = [];
const add = (name: string, category: Category, run: (input: unknown) => unknown) =>
  entries.push({ name, category, run });

const SHAPE = {
  number: z.number(),
  negNumber: z.number(),
  maxNumber: z.number(),
  string: z.string(),
  longString: z.string(),
  boolean: z.boolean(),
  deeplyNested: z.object({ foo: z.string(), num: z.number(), bool: z.boolean() }),
};

// --- zod ---
const zodSchema = z.object(SHAPE);
const zodCompiled = z.compile(zodSchema);
add("zod 4 (compiled)", "parseSafe", (d) => zodCompiled.parse(d));
add("zod 4", "parseSafe", (d) => zodSchema.parse(d));

const zodLoose = z.looseObject({
  ...SHAPE,
  deeplyNested: z.looseObject({ foo: z.string(), num: z.number(), bool: z.boolean() }),
});
const zodLooseCompiled = z.compile(zodLoose);
add("zod 4 (compiled)", "assertLoose", (d) => z.validate(zodLooseCompiled, d));
add("zod 4", "assertLoose", (d) => z.validate(zodLoose, d));

// --- zod 3 ---
const zod3Leaves = { foo: z3.string(), num: z3.number(), bool: z3.boolean() };
const zod3Shape = {
  number: z3.number(),
  negNumber: z3.number(),
  maxNumber: z3.number(),
  string: z3.string(),
  longString: z3.string(),
  boolean: z3.boolean(),
  deeplyNested: z3.object(zod3Leaves),
};
const zod3Schema = z3.object(zod3Shape);
add("zod 3", "parseSafe", (d) => zod3Schema.parse(d));
const zod3Loose = z3.object({ ...zod3Shape, deeplyNested: z3.object(zod3Leaves).passthrough() }).passthrough();
add("zod 3", "assertLoose", (d) => {
  zod3Loose.parse(d);
  return true;
});

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
add("valibot", "parseSafe", (d) => v.parse(valibotSchema, d, { abortEarly: true }));
add("valibot", "assertLoose", (d) => {
  v.parse(valibotSchema, d, { abortEarly: true });
  return true;
});

// --- arktype ---
const arktypeShape = {
  number: "number",
  negNumber: "number",
  maxNumber: "number",
  string: "string",
  longString: "string",
  boolean: "boolean",
  deeplyNested: { foo: "string", num: "number", bool: "boolean" },
} as const;
const arktypeLoose = type(arktypeShape as any);
// upstream arktype only enters assertLoose, with the boolean check that keeps unknown keys
add("arktype", "assertLoose", (d) => {
  if (arktypeLoose.allows(d)) return true;
  throw new Error("Invalid");
});
// parseSafe needs unknown keys deleted at every level, which is a different arktype configuration; arktype returns its errors rather than throwing, so the caller pays for that check
const arktypeStrip = (arktypeLoose as any).onDeepUndeclaredKey("delete");
add("arktype", "parseSafe", (d) => {
  const out = arktypeStrip(d);
  if (out instanceof type.errors) throw new Error("Invalid");
  return out;
});

// --- effect ---
const effectSchema = Schema.Struct({
  number: Schema.Number,
  negNumber: Schema.Number,
  maxNumber: Schema.Number,
  string: Schema.String,
  longString: Schema.String,
  boolean: Schema.Boolean,
  deeplyNested: Schema.Struct({ foo: Schema.String, num: Schema.Number, bool: Schema.Boolean }),
});
const effectParse = Schema.decodeUnknownSync(effectSchema, { onExcessProperty: undefined });
const effectAssert = Schema.asserts(effectSchema, { onExcessProperty: "ignore" });
add("effect", "parseSafe", (d) => effectParse(d));
add("effect", "assertLoose", (d) => {
  effectAssert(d);
  return true;
});

// --- yup ---
const yupSchema = yup.object({
  number: yup.number().required(),
  negNumber: yup.number().required(),
  maxNumber: yup.number().required(),
  string: yup.string().required(),
  longString: yup.string().required(),
  boolean: yup.bool().required(),
  deeplyNested: yup.object({ foo: yup.string().required(), num: yup.number().required(), bool: yup.bool().required() }),
});
add("yup", "parseSafe", (d) => yupSchema.validateSync(d, { recursive: true, strict: false, stripUnknown: true }));
add("yup", "assertLoose", (d) => {
  if (!yupSchema.isValidSync(d, { recursive: true, strict: false })) throw new Error("Invalid");
  return true;
});

// --- typebox ---
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
// TypeCompiler generates only the check; typebox has no compiled strip, so parseSafe pays the dynamic Value module for it — on a clone, so the result is a new object like every other parseSafe entry
add("typebox (compiled)", "parseSafe", (d) => {
  if (!typeboxCompiled.Check(d)) throw new Error("Invalid");
  return Value.Clean(typeboxSchema, Value.Clone(d));
});
add("typebox (compiled)", "assertLoose", (d) => {
  if (!typeboxCompiled.Check(d)) throw new Error("Invalid");
  return true;
});
add("typebox", "parseSafe", (d) => {
  if (!Value.Check(typeboxSchema, d)) throw new Error("Invalid");
  return Value.Clean(typeboxSchema, Value.Clone(d));
});
add("typebox", "assertLoose", (d) => {
  if (!Value.Check(typeboxSchema, d)) throw new Error("Invalid");
  return true;
});

// --- typia, a transformer that generates its checks at build time; see typia-case/README.md ---
const typiaCase = createRequire(import.meta.url)("./typia-case/build/index.cjs") as {
  is: (d: unknown) => boolean;
  clone: (d: unknown) => unknown;
};
add("typia", "parseSafe", (d) => {
  if (!typiaCase.is(d)) throw new Error("Invalid");
  return typiaCase.clone(d);
});
add("typia", "assertLoose", (d) => {
  if (!typiaCase.is(d)) throw new Error("Invalid");
  return true;
});

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

let sink = 0;
let escaped: unknown;

const problems: string[] = [];
const runners: { entry: Entry; fn: () => void }[] = [];

for (const e of entries) {
  const id = `${e.name} [${e.category}]`;

  // moltar's own tests for the category, run before anything is timed. Inputs are unfrozen clones: arktype's strip writes through the input object on its way to building the result, so a frozen fixture rejects it for the wrong reason.
  const clone = (o: any) => ({ ...o, deeplyNested: { ...o.deeplyNested } });
  try {
    if (e.category === "parseSafe") {
      if (!deepEq(e.run(clone(DATA)), DATA)) {
        problems.push(`${id}: did not round-trip the clean fixture`);
        continue;
      }
      if (!deepEq(e.run(clone(DIRTY)), DATA)) {
        problems.push(`${id}: did not strip unknown keys, so it is not doing parseSafe's work`);
        continue;
      }
    } else if (e.run(clone(DATA)) !== true) {
      problems.push(`${id}: did not accept the fixture`);
      continue;
    }
  } catch (err) {
    problems.push(`${id}: threw on a valid input (${(err as Error).message})`);
    continue;
  }

  let rejects = false;
  try {
    const out = e.run({ ...clone(DATA), number: "foo" });
    rejects = e.category === "assertLoose" ? out !== true : false;
  } catch {
    rejects = true;
  }
  if (!rejects) {
    problems.push(`${id}: accepted an invalid input`);
    continue;
  }

  // distinct objects, and an array load rather than a constant, so nothing is hoisted and a pass-through library cannot escape one shared reference
  const source = e.category === "parseSafe" ? DIRTY : DATA;
  const pool = Array.from({ length: 64 }, (_, i) => ({
    ...source,
    number: i,
    deeplyNested: { ...source.deeplyNested },
  }));
  let idx = 0;

  runners.push({
    entry: e,
    fn: () => {
      const r = e.run(pool[idx++ & 63]);
      sink += r ? 1 : 0;
      escaped = r;
    },
  });
}

// guard: the compiled zod rows must be running generated code, not silently measuring the fallback
for (const [label, sch] of [
  ["parseSafe", zodSchema],
  ["assertLoose", zodLoose],
] as const) {
  if (compileFn(sch as any)(DIRTY) === INVALID) {
    problems.push(`zod ${label}: the fast path rejected the fixture, so the compiled row measures the fallback`);
  }
}

for (const r of runners) r.fn();
const iters = new Map(runners.map((r) => [`${r.entry.name}|${r.entry.category}`, calibrate(r.fn)]));
const best = new Map(runners.map((r) => [`${r.entry.name}|${r.entry.category}`, Number.POSITIVE_INFINITY]));

for (let round = 0; round < ROUNDS; round++) {
  for (const r of runners) {
    const key = `${r.entry.name}|${r.entry.category}`;
    const ms = timed(r.fn, iters.get(key)!);
    if (ms < best.get(key)!) best.set(key, ms);
  }
}

const rows = runners
  .map((r) => {
    const key = `${r.entry.name}|${r.entry.category}`;
    return { name: r.entry.name, category: r.entry.category, ops: (iters.get(key)! / best.get(key)!) * 1000 };
  })
  .sort((a, b) => b.ops - a.ops);

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : n.toFixed(0);

console.log();
console.log(`moltar fixture — best of ${ROUNDS} interleaved rounds, ops/sec`);
for (const category of ["parseSafe", "assertLoose"] as const) {
  const group = rows.filter((r) => r.category === category);
  if (!group.length) continue;
  console.log();
  console.log(
    category === "parseSafe"
      ? "parseSafe — returns a new object with unknown keys removed:"
      : "assertLoose — returns a boolean, ignores unknown keys, allocates nothing:"
  );
  const top = group[0].ops;
  for (const r of group) console.log(`  ${r.name.padEnd(20)}${fmt(r.ops).padStart(9)}  ${(r.ops / top).toFixed(2)}x`);
}
console.log();
if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log(`  ${p}`);
  console.log();
}
console.log(JSON.stringify({ rows }));
console.log(`checksum ${sink}${escaped ? "" : " -"}`);
