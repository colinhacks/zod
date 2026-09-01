import * as z from "zod";

// What early abort buys the runtime parse path, as a function of schema size and of where the first failure sits.
//
// The two sides differ by ONE bit: the same build, the same schema, the same call site, parsed with `abortEarly: false` and `abortEarly: true`. Both context objects carry both keys so they share a hidden class and the only difference measured is the guard itself. That is why this runs in one process rather than loading two revisions — a second copy of zod would make every leaf parse call site polymorphic.
//
// Methodology follows validate-vs-safeparse.ts: fixed iteration count with gc() between samples, the two sides interleaved inside each round, best of N rounds kept. Inputs come from a rotating pool so the call is not loop-invariant, and both the boolean and the issue count are consumed into a sink.

interface Case {
  name: string;
  group: string;
  schema: z.ZodType;
  valid: unknown;
  invalid: unknown;
}

const cases: Case[] = [];
const add = (group: string, name: string, schema: z.ZodType, valid: unknown, invalid: unknown) =>
  cases.push({ group, name, schema, valid, invalid });

// ---- key-count sweep, one wrong key at three positions ---------------------
const objShape = (n: number) => {
  const shape: Record<string, z.ZodType> = {};
  for (let i = 0; i < n; i++) shape[`k${i}`] = z.string();
  return z.object(shape) as z.ZodType;
};
const objInput = (n: number) => {
  const o: Record<string, unknown> = {};
  for (let i = 0; i < n; i++) o[`k${i}`] = "v";
  return o;
};

for (const n of [1, 5, 20, 80]) {
  const schema = objShape(n);
  const valid = objInput(n);
  const mid = Math.floor(n / 2);
  add("object, wrong key at middle", `${n} keys`, schema, valid, { ...valid, [`k${mid}`]: 1 });
  if (n > 1) {
    add("object, wrong key at first", `${n} keys`, schema, valid, { ...valid, k0: 1 });
    add("object, wrong key at last", `${n} keys`, schema, valid, { ...valid, [`k${n - 1}`]: 1 });
    const missing = { ...valid };
    delete missing[`k${mid}`];
    add("object, missing key at middle", `${n} keys`, schema, valid, missing);
  }
}

// ---- arrays ----------------------------------------------------------------
for (const n of [1, 5, 20, 80]) {
  const valid = Array.from({ length: n }, (_, i) => `s${i}`);
  const mid = Math.floor(n / 2);
  add(
    "array, wrong element at middle",
    `${n} items`,
    z.array(z.string()),
    valid,
    valid.map((s, i) => (i === mid ? i : s))
  );
}

// ---- nested shapes ---------------------------------------------------------
const rowSchema = z.object({ id: z.number(), name: z.string(), active: z.boolean() });
for (const n of [5, 20, 80]) {
  const valid = Array.from({ length: n }, (_, i) => ({ id: i, name: `n${i}`, active: true }));
  const mid = Math.floor(n / 2);
  add(
    "array of objects, wrong field at middle row",
    `${n} rows`,
    z.array(rowSchema),
    valid,
    valid.map((r, i) => (i === mid ? { ...r, name: 0 } : r))
  );
}

const deep = (depth: number): z.ZodType =>
  depth === 0
    ? z.object({ leaf: z.string(), a: z.string(), b: z.string() })
    : z.object({ next: deep(depth - 1), a: z.string(), b: z.string() });
const deepInput = (depth: number, badAt: number): any =>
  depth === 0
    ? { leaf: badAt === 0 ? 1 : "x", a: "x", b: "x" }
    : { next: deepInput(depth - 1, badAt - 1), a: "x", b: "x" };
add("nested objects, bad leaf", "depth 8", deep(8), deepInput(8, -1), deepInput(8, 8));

// ---- containers other than object/array ------------------------------------
add(
  "tuple + rest, wrong at middle",
  "40 rest",
  z.tuple([z.string()], z.number()),
  ["a", ...Array.from({ length: 40 }, (_, i) => i)],
  ["a", ...Array.from({ length: 40 }, (_, i) => (i === 20 ? "no" : i))]
);
add(
  "set, wrong at middle",
  "40 items",
  z.set(z.string()),
  new Set(Array.from({ length: 40 }, (_, i) => `s${i}`)),
  new Set<any>(Array.from({ length: 40 }, (_, i) => (i === 20 ? i : `s${i}`)))
);
add(
  "map, wrong at middle",
  "40 entries",
  z.map(z.string(), z.number()),
  new Map(Array.from({ length: 40 }, (_, i) => [`k${i}`, i] as [string, number])),
  new Map<any, any>(Array.from({ length: 40 }, (_, i) => [`k${i}`, i === 20 ? "no" : i]))
);
add(
  "record, wrong at middle (no guard by design)",
  "40 keys",
  z.record(z.string(), z.number()),
  Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, i])),
  Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, i === 20 ? "no" : i]))
);

// ---------------------------------------------------------------------------

const collect = typeof (globalThis as any).gc === "function" ? (globalThis as any).gc : () => {};
const HAS_GC = typeof (globalThis as any).gc === "function";
const ROUNDS = 15;

let sink = 0;
let escaped: unknown;

// Both carry both keys, so the guard is the only difference the measurement can see.
const CTX_OFF = { async: false, abortEarly: false } as any;
const CTX_ON = { async: false, abortEarly: true } as any;

function timed(fn: () => void, iters: number): number {
  collect();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function calibrate(fn: () => void): number {
  let iters = 64;
  for (;;) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iters; i++) fn();
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (ms > 25 || iters > 4_000_000) return iters;
    iters = Math.max(iters * 2, Math.ceil((iters * 40) / Math.max(ms, 0.05)));
  }
}

interface Measurement {
  offNs: number;
  onNs: number;
  issuesOff: number;
  issuesOn: number;
}

function measure(schema: z.ZodType, input: unknown): Measurement {
  const pool = Array.from({ length: 64 }, () => input);
  let idx = 0;
  // _zod.run is read at call time: the object JIT replaces it on first use, so a reference captured up front would measure the stale interpreted path.
  const off = () => {
    const r = (schema as any)._zod.run({ value: pool[idx++ & 63], issues: [] }, CTX_OFF);
    sink += r.issues.length + (r.issues.length === 0 ? 1 : 0);
    escaped = r;
  };
  const on = () => {
    const r = (schema as any)._zod.run({ value: pool[idx++ & 63], issues: [] }, CTX_ON);
    sink += r.issues.length + (r.issues.length === 0 ? 1 : 0);
    escaped = r;
  };

  const issuesOff = (schema as any)._zod.run({ value: input, issues: [] }, CTX_OFF).issues.length;
  const issuesOn = (schema as any)._zod.run({ value: input, issues: [] }, CTX_ON).issues.length;

  const iters = calibrate(off);
  for (let i = 0; i < 5; i++) {
    off();
    on();
  }

  let bestOff = Number.POSITIVE_INFINITY;
  let bestOn = Number.POSITIVE_INFINITY;
  for (let r = 0; r < ROUNDS; r++) {
    bestOff = Math.min(bestOff, timed(off, iters));
    bestOn = Math.min(bestOn, timed(on, iters));
  }
  return { offNs: (bestOff * 1e6) / iters, onNs: (bestOn * 1e6) / iters, issuesOff, issuesOn };
}

interface Row {
  group: string;
  name: string;
  valid: Measurement;
  invalid: Measurement;
}

const problems: string[] = [];
for (const c of cases) {
  if (c.schema.safeParse(c.valid).success !== true) problems.push(`${c.group} ${c.name}: "valid" does not parse`);
  if (c.schema.safeParse(c.invalid).success !== false) problems.push(`${c.group} ${c.name}: "invalid" parses`);
  if (z.validate(c.schema, c.valid) !== true) problems.push(`${c.group} ${c.name}: validate rejects valid`);
  if (z.validate(c.schema, c.invalid) !== false) problems.push(`${c.group} ${c.name}: validate accepts invalid`);
}

// Warm every case before timing any, so each is measured against the same polluted-inline-cache state.
for (let i = 0; i < 200; i++) {
  for (const c of cases) {
    for (const input of [c.valid, c.invalid]) {
      sink += (c.schema as any)._zod.run({ value: input, issues: [] }, CTX_OFF).issues.length;
      sink += (c.schema as any)._zod.run({ value: input, issues: [] }, CTX_ON).issues.length;
    }
  }
}

const rows: Row[] = [];
for (const c of cases) {
  rows.push({
    group: c.group,
    name: c.name,
    valid: measure(c.schema, c.valid),
    invalid: measure(c.schema, c.invalid),
  });
}

const fmtNs = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}µs` : `${n.toFixed(0)}ns`);
const pad = (s: string, n: number) => s.padEnd(n);
const padL = (s: string, n: number) => s.padStart(n);

console.log();
console.log(
  `abortEarly off vs on, same build, best of ${ROUNDS} interleaved rounds${HAS_GC ? "" : " (no gc: run with --expose-gc)"}`
);
console.log();
console.log(
  `${pad("case", 44)}${padL("inv off", 10)}${padL("inv on", 10)}${padL("x", 7)}${padL("issues", 10)}${padL("val off", 10)}${padL("val on", 9)}${padL("x", 7)}`
);
console.log("-".repeat(107));
let lastGroup = "";
for (const r of rows) {
  if (r.group !== lastGroup) {
    console.log(r.group);
    lastGroup = r.group;
  }
  console.log(
    `${pad(`  ${r.name}`, 44)}` +
      `${padL(fmtNs(r.invalid.offNs), 10)}${padL(fmtNs(r.invalid.onNs), 10)}${padL(`${(r.invalid.offNs / r.invalid.onNs).toFixed(2)}x`, 7)}` +
      `${padL(`${r.invalid.issuesOff}→${r.invalid.issuesOn}`, 10)}` +
      `${padL(fmtNs(r.valid.offNs), 10)}${padL(fmtNs(r.valid.onNs), 9)}${padL(`${(r.valid.offNs / r.valid.onNs).toFixed(2)}x`, 7)}`
  );
}
console.log("-".repeat(107));

const validRatios = rows.map((r) => r.valid.offNs / r.valid.onNs).sort((a, b) => a - b);
console.log(
  `valid input (should be ~1.00x): median ${validRatios[Math.floor(validRatios.length / 2)].toFixed(3)}x, range ${validRatios[0].toFixed(3)}x-${validRatios[validRatios.length - 1].toFixed(3)}x`
);

if (problems.length) {
  console.log();
  console.log("PROBLEMS:");
  for (const p of problems) console.log(`  ${p}`);
}
console.log();
console.log(`sink ${sink} ${typeof escaped}`);
