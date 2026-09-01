import * as z from "zod";
import { ZodCompileUnsupportedError, compile } from "zod/v4/core";

// z.validate(schema, input) vs schema.safeParse(input).success, across schema shapes, on valid and invalid input.
//
// Three tables. The first two answer what a caller holding one schema gains by asking for a boolean instead of a result: the same pair of calls on a plain schema, and on that schema passed through z.compile(). The third is the cross-mode upgrade — compiled validate against plain safeParse — which is what a caller adopting both at once gains.
//
// Methodology follows compile-matrix.ts: absolute ops/sec drifts by tens of percent between runs, so all four calls are measured *interleaved* inside one round and the best of N rounds is kept. That is what makes the cross-mode ratio legitimate; measuring the plain schema to completion and then the compiled one would put whatever drifted between those two blocks straight onto it. safeParse allocates a result object per call while validate allocates nothing, so a time-boxed loop would sample whatever the collector is doing — the harness uses a fixed iteration count with gc() between samples instead. The failing result's ZodError is not part of that: failure() builds it lazily behind a getter, so reading only .success never constructs one.

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

interface Pair {
  plain: Measurement;
  compiled: Measurement | null;
}

// all four calls alternate inside a round and share one iteration count, so every ratio the harness prints is paired
function measure(plain: z.ZodType, compiled: z.ZodType | null, input: unknown): Pair {
  // Feed the input through an array load. Passed as a constant the whole call is loop-invariant and V8 hoists it out of the timing loop.
  const pool = Array.from({ length: 64 }, () => input);
  let idx = 0;
  const safeParseOn = (s: z.ZodType) => () => {
    const r = s.safeParse(pool[idx++ & 63]);
    sink += r.success ? 1 : 0;
    escaped = r;
  };
  const validateOn = (s: z.ZodType) => () => {
    const ok = z.validate(s, pool[idx++ & 63]);
    sink += ok ? 1 : 0;
    escaped = ok;
  };

  const ops = [safeParseOn(plain), validateOn(plain)];
  if (compiled) ops.push(safeParseOn(compiled), validateOn(compiled));

  // the plain safeParse is the slowest of the four, so calibrating on it keeps every block at or under the ~40ms target
  const iters = calibrate(ops[0]);
  for (let i = 0; i < 3; i++) for (const op of ops) op();

  const best = ops.map(() => Number.POSITIVE_INFINITY);
  for (let r = 0; r < ROUNDS; r++)
    for (let i = 0; i < ops.length; i++) best[i] = Math.min(best[i], timed(ops[i], iters));

  const ns = (i: number) => (best[i] * 1e6) / iters;
  return {
    plain: { safeParseNs: ns(0), validateNs: ns(1) },
    compiled: compiled ? { safeParseNs: ns(2), validateNs: ns(3) } : null,
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

interface CasePair {
  name: string;
  plain: z.ZodType;
  compiled: z.ZodType | null;
  valid: unknown;
  invalid: unknown;
}

const targets: Target[] = [];
const pairs: CasePair[] = [];
for (const c of cases) {
  if (c.schema.safeParse(c.valid).success !== true) problems.push(`${c.name}: "valid" input does not parse`);
  if (c.schema.safeParse(c.invalid).success !== false) problems.push(`${c.name}: "invalid" input parses`);
  if (z.validate(c.schema, c.valid) !== true) problems.push(`${c.name}: validate rejects valid input`);
  if (z.validate(c.schema, c.invalid) !== false) problems.push(`${c.name}: validate accepts invalid input`);
  targets.push({ name: c.name, compiled: false, schema: c.schema, valid: c.valid, invalid: c.invalid });

  // strict: a silent uncompiled fallback would publish a "compiled" row that is really a second uncompiled measurement
  let compiled: z.ZodType | null = null;
  try {
    compiled = compile(c.schema, { strict: true });
  } catch (err) {
    problems.push(
      `${c.name}: did not compile (${err instanceof ZodCompileUnsupportedError ? "unsupported" : (err as Error).name})`
    );
  }
  if (compiled) {
    if (z.validate(compiled, c.valid) !== true || z.validate(compiled, c.invalid) !== false)
      problems.push(`${c.name}: compiled validate disagrees with the runtime`);
    targets.push({ name: c.name, compiled: true, schema: compiled, valid: c.valid, invalid: c.invalid });
  }
  pairs.push({ name: c.name, plain: c.schema, compiled, valid: c.valid, invalid: c.invalid });
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

for (const p of pairs) {
  const valid = measure(p.plain, p.compiled, p.valid);
  const invalid = measure(p.plain, p.compiled, p.invalid);
  rows.push({ name: p.name, compiled: false, valid: valid.plain, invalid: invalid.plain });
  if (valid.compiled && invalid.compiled)
    rows.push({ name: p.name, compiled: true, valid: valid.compiled, invalid: invalid.compiled });
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

// The cross-mode table: what a caller gains by adopting both at once. Its two columns come from the same interleaved rounds as the two tables above, so this ratio is paired like theirs.
{
  const cross = rows
    .filter((r) => !r.compiled)
    .map((r) => ({ name: r.name, compiled: rows.find((o) => o.name === r.name && o.compiled) }))
    .filter((r): r is { name: string; compiled: Row } => !!r.compiled);
  if (cross.length) {
    console.log();
    console.log(
      `compiled z.validate vs plain safeParse().success — the cross-mode upgrade, best of ${ROUNDS} interleaved rounds`
    );
    console.log();
    console.log(`${pad("schema", 26)}${padL("plain sp", 11)}${padL("comp v", 10)}${padL("x", 8)}`);
    console.log("-".repeat(55));
    for (const c of cross) {
      const plainSp = rows.find((o) => o.name === c.name && !o.compiled)!.invalid.safeParseNs;
      const compV = c.compiled.invalid.validateNs;
      console.log(
        `${pad(c.name, 26)}${padL(fmtNs(plainSp), 11)}${padL(fmtNs(compV), 10)}${padL(`${(plainSp / compV).toFixed(2)}x`, 8)}`
      );
    }
    console.log("-".repeat(55));
    const ratios = cross
      .map(
        (c) => rows.find((o) => o.name === c.name && !o.compiled)!.invalid.safeParseNs / c.compiled.invalid.validateNs
      )
      .sort((a, b) => a - b);
    console.log(
      `invalid input: median ${ratios[Math.floor(ratios.length / 2)].toFixed(1)}x, range ${ratios[0].toFixed(1)}x-${ratios[ratios.length - 1].toFixed(1)}x`
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
