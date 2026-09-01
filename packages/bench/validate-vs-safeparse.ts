import * as z from "zod";
import { ZodCompileUnsupportedError, compile } from "zod/v4/core";

// z.validate(schema, input) vs schema.safeParse(input).success, across schema shapes, on valid and invalid input.
//
// Two independent comparisons, reported separately: the same pair of calls on a plain schema, and on that schema passed through z.compile(). Neither table compares compiled against uncompiled — each answers what a caller holding one schema gains by asking for a boolean instead of a result.
//
// Methodology follows compile-matrix.ts: absolute ops/sec drifts by tens of percent between runs, so the two calls are measured *interleaved* inside one round and the best of N rounds is kept. safeParse allocates a result object per call while validate allocates nothing, so a time-boxed loop would sample whatever the collector is doing — the harness uses a fixed iteration count with gc() between samples instead. The failing result's ZodError is not part of that: failure() builds it lazily behind a getter, so reading only .success never constructs one.

interface Case {
  name: string;
  schema: z.ZodType;
  valid: unknown;
  invalid: unknown;
}

const cases: Case[] = [];
const add = (name: string, schema: z.ZodType, valid: unknown, invalid: unknown) =>
  cases.push({ name, schema, valid, invalid });

add("z.string()", z.string(), "hello world", 42);
add("z.number()", z.number(), 42.5, "42.5");
add("z.boolean()", z.boolean(), true, "true");
add("z.string().email()", z.email(), "user@example.com", "not-an-email");

const flat5 = { a: "x", b: 1, c: true, d: "y", e: 2 };
add(
  "z.object(), 5 keys",
  z.object({ a: z.string(), b: z.number(), c: z.boolean(), d: z.string(), e: z.number() }),
  flat5,
  { ...flat5, c: "not a boolean" }
);

const wide20 = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, "v"]));
add(
  "z.object(), 20 keys",
  z.object(Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, z.string()]))) as z.ZodType,
  wide20,
  { ...wide20, k9: 9 }
);

const moltarValid = {
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: "string",
  longString: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  boolean: true,
  deeplyNested: { foo: "bar", num: 1, bool: false },
};
add(
  "nested object",
  z.object({
    number: z.number(),
    negNumber: z.number(),
    maxNumber: z.number(),
    string: z.string(),
    longString: z.string(),
    boolean: z.boolean(),
    deeplyNested: z.object({ foo: z.string(), num: z.number(), bool: z.boolean() }),
  }),
  moltarValid,
  { ...moltarValid, deeplyNested: { ...moltarValid.deeplyNested, num: "1" } }
);

add(
  "z.array(z.string()), 10",
  z.array(z.string()),
  Array.from({ length: 10 }, (_, i) => `s${i}`),
  Array.from({ length: 10 }, (_, i) => (i === 6 ? 6 : `s${i}`))
);
add(
  "z.array(z.object()), 10",
  z.array(z.object({ id: z.number(), name: z.string() })),
  Array.from({ length: 10 }, (_, i) => ({ id: i, name: `n${i}` })),
  Array.from({ length: 10 }, (_, i) => ({ id: i, name: i === 6 ? 6 : `n${i}` }))
);
add("z.tuple() of 3", z.tuple([z.string(), z.number(), z.boolean()]), ["a", 1, true], ["a", 1, "true"]);
add(
  "z.union() of 3 objects",
  z.union([z.object({ a: z.string() }), z.object({ b: z.number() }), z.object({ c: z.boolean() })]),
  { c: true },
  { c: "true" }
);
add(
  "z.discriminatedUnion() of 3",
  z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("k0"), v: z.number() }),
    z.object({ kind: z.literal("k1"), v: z.number() }),
    z.object({ kind: z.literal("k2"), v: z.number() }),
  ]),
  { kind: "k2", v: 1 },
  { kind: "k2", v: "1" }
);

// ---------------------------------------------------------------------------

const collect = typeof (globalThis as any).gc === "function" ? (globalThis as any).gc : () => {};
const HAS_GC = typeof (globalThis as any).gc === "function";

const ROUNDS = 15;

// Consumed by every timed call and printed at the end. Without this V8 sees the result is dead and eliminates the call outright.
let sink = 0;
let escaped: unknown;

function timed(fn: () => void, iters: number): number {
  collect();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  return Number(process.hrtime.bigint() - start) / 1e6; // ms
}

/** Iterations that put one measurement near ~40ms, so a round is short but not noise. */
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
  safeParseNs: number;
  validateNs: number;
}

function measure(schema: z.ZodType, input: unknown): Measurement {
  // Feed the input through an array load. Passed as a constant the whole call is loop-invariant and V8 hoists it out of the timing loop.
  const pool = Array.from({ length: 64 }, () => input);
  let idx = 0;
  const safeParse = () => {
    const r = schema.safeParse(pool[idx++ & 63]);
    sink += r.success ? 1 : 0;
    escaped = r;
  };
  const validate = () => {
    const ok = z.validate(schema, pool[idx++ & 63]);
    sink += ok ? 1 : 0;
    escaped = ok;
  };

  const iters = calibrate(safeParse);
  for (let i = 0; i < 3; i++) {
    safeParse();
    validate();
  }

  let bestSafeParse = Number.POSITIVE_INFINITY;
  let bestValidate = Number.POSITIVE_INFINITY;
  for (let r = 0; r < ROUNDS; r++) {
    bestSafeParse = Math.min(bestSafeParse, timed(safeParse, iters));
    bestValidate = Math.min(bestValidate, timed(validate, iters));
  }
  return {
    safeParseNs: (bestSafeParse * 1e6) / iters,
    validateNs: (bestValidate * 1e6) / iters,
  };
}

interface Row {
  name: string;
  compiled: boolean;
  valid: Measurement;
  invalid: Measurement;
}

const rows: Row[] = [];
const problems: string[] = [];

interface Target {
  name: string;
  compiled: boolean;
  schema: z.ZodType;
  valid: unknown;
  invalid: unknown;
}

const targets: Target[] = [];
for (const c of cases) {
  if (c.schema.safeParse(c.valid).success !== true) problems.push(`${c.name}: "valid" input does not parse`);
  if (c.schema.safeParse(c.invalid).success !== false) problems.push(`${c.name}: "invalid" input parses`);
  if (z.validate(c.schema, c.valid) !== true) problems.push(`${c.name}: validate rejects valid input`);
  if (z.validate(c.schema, c.invalid) !== false) problems.push(`${c.name}: validate accepts invalid input`);
  targets.push({ name: c.name, compiled: false, schema: c.schema, valid: c.valid, invalid: c.invalid });

  // strict: a silent uncompiled fallback would publish a "compiled" row that is really a second uncompiled measurement
  let compiled: z.ZodType;
  try {
    compiled = compile(c.schema, { strict: true });
  } catch (err) {
    problems.push(
      `${c.name}: did not compile (${err instanceof ZodCompileUnsupportedError ? "unsupported" : (err as Error).name})`
    );
    continue;
  }
  if (z.validate(compiled, c.valid) !== true || z.validate(compiled, c.invalid) !== false)
    problems.push(`${c.name}: compiled validate disagrees with the runtime`);
  targets.push({ name: c.name, compiled: true, schema: compiled, valid: c.valid, invalid: c.invalid });
}

// Every case shares one safeParse/validate call site inside measure(), so those inline caches go megamorphic as the sweep proceeds and a case measured first would see a cleaner cache than one measured last. Warm every target before timing any, so each is measured against the same polluted-cache state.
for (let i = 0; i < 200; i++) {
  for (const t of targets) {
    for (const input of [t.valid, t.invalid]) {
      sink += t.schema.safeParse(input).success ? 1 : 0;
      sink += z.validate(t.schema, input) ? 1 : 0;
    }
  }
}

for (const t of targets) {
  rows.push({
    name: t.name,
    compiled: t.compiled,
    valid: measure(t.schema, t.valid),
    invalid: measure(t.schema, t.invalid),
  });
}

const fmtNs = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}µs` : `${n.toFixed(0)}ns`);
const pad = (s: string, n: number) => s.padEnd(n);
const padL = (s: string, n: number) => s.padStart(n);

for (const mode of [false, true]) {
  const subset = rows.filter((r) => r.compiled === mode);
  if (!subset.length) continue;
  console.log();
  console.log(
    `${mode ? "compiled with z.compile()" : "plain schemas"} — z.validate vs safeParse().success, best of ${ROUNDS} interleaved rounds${HAS_GC ? "" : " (no gc: run with --expose-gc)"}`
  );
  console.log();
  console.log(
    `${pad("schema", 26)}${padL("valid sp", 11)}${padL("valid v", 10)}${padL("x", 8)}${padL("invalid sp", 12)}${padL("invalid v", 11)}${padL("x", 8)}`
  );
  console.log("-".repeat(86));
  for (const r of subset) {
    console.log(
      `${pad(r.name, 26)}` +
        `${padL(fmtNs(r.valid.safeParseNs), 11)}${padL(fmtNs(r.valid.validateNs), 10)}${padL(`${(r.valid.safeParseNs / r.valid.validateNs).toFixed(2)}x`, 8)}` +
        `${padL(fmtNs(r.invalid.safeParseNs), 12)}${padL(fmtNs(r.invalid.validateNs), 11)}${padL(`${(r.invalid.safeParseNs / r.invalid.validateNs).toFixed(2)}x`, 8)}`
    );
  }
  console.log("-".repeat(86));
  for (const [label, key] of [
    ["valid input  ", "valid"],
    ["invalid input", "invalid"],
  ] as const) {
    const ratios = subset.map((r) => r[key].safeParseNs / r[key].validateNs).sort((a, b) => a - b);
    console.log(
      `${label}: median ${ratios[Math.floor(ratios.length / 2)].toFixed(1)}x, range ${ratios[0].toFixed(1)}x-${ratios[ratios.length - 1].toFixed(1)}x`
    );
  }
}

if (problems.length) {
  console.log();
  console.log("PROBLEMS:");
  for (const p of problems) console.log(`  ${p}`);
}
console.log();
console.log(`sink ${sink} ${typeof escaped}`);
console.log(`JSON ${JSON.stringify(rows)}`);
