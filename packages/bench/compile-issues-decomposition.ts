// Decomposes a failing safeParse into walk vs error construction, per wrapper mode. `walk` = _zod.run returning raw issues (no finalizeIssue, no ZodError, no result object); error construction = total − walk, and it is contractually identical in every mode. The theoretical ceiling column is the speedup with a FREE walk — what any compiler tops out at while the error contract stands.
import * as z from "zod";
import { compile } from "../zod/src/v4/core/compile.js";

declare global {
  var gc: undefined | (() => void);
}
if (!globalThis.gc) {
  console.error("run with --expose-gc");
  process.exit(1);
}

function nested(depth: number, fanout: number): z.ZodType {
  if (depth === 0) return z.string();
  const shape: Record<string, z.ZodType> = {};
  for (let i = 0; i < fanout; i++) shape[`k${i}`] = nested(depth - 1, fanout);
  return z.object(shape);
}
function fill(depth: number, fanout: number, leaf: unknown): unknown {
  if (depth === 0) return leaf;
  const o: Record<string, unknown> = {};
  for (let i = 0; i < fanout; i++) o[`k${i}`] = fill(depth - 1, fanout, leaf);
  return o;
}
const big = nested(5, 3);
const bigSparse = fill(5, 3, "x") as any;
bigSparse.k1.k2.k0.k1.k2 = 42;

interface Case {
  name: string;
  schema: z.ZodType;
  invalid: unknown;
  iters: number;
}
const cases: Case[] = [
  { name: "string", schema: z.string(), invalid: 42, iters: 200_000 },
  {
    name: "object-5key",
    schema: z.object({ a: z.string(), b: z.number(), c: z.boolean(), d: z.string(), e: z.number() }),
    invalid: { a: "x", b: 1, c: true, d: 5, e: 2 },
    iters: 100_000,
  },
  {
    name: "nested-3deep",
    schema: z.object({ a: z.object({ b: z.object({ c: z.string() }) }) }),
    invalid: { a: { b: { c: 42 } } },
    iters: 100_000,
  },
  {
    name: "array-20",
    schema: z.array(z.number()),
    invalid: Array.from({ length: 20 }, (_, i) => (i === 10 ? "x" : i)),
    iters: 50_000,
  },
  {
    name: "tuple-4",
    schema: z.tuple([z.string(), z.number(), z.boolean(), z.string()]),
    invalid: ["a", "no", true, "b"],
    iters: 100_000,
  },
  {
    name: "union-3",
    schema: z.union([z.string(), z.number(), z.boolean()]),
    invalid: { nope: 1 },
    iters: 50_000,
  },
  {
    name: "union-3obj",
    schema: z.union([z.object({ a: z.string() }), z.object({ b: z.number() }), z.object({ c: z.boolean() })]),
    invalid: { c: "wrong" },
    iters: 50_000,
  },
  {
    name: "discunion-3",
    schema: z.discriminatedUnion("t", [
      z.object({ t: z.literal("a"), x: z.string() }),
      z.object({ t: z.literal("b"), y: z.number() }),
      z.object({ t: z.literal("c"), z: z.boolean() }),
    ]),
    invalid: { t: "b", y: "no" },
    iters: 100_000,
  },
  {
    name: "record",
    schema: z.record(z.string(), z.number()),
    invalid: { a: 1, b: "x", c: 3 },
    iters: 50_000,
  },
  { name: "leaf-243-sparse", schema: big, invalid: bigSparse, iters: 3_000 },
  { name: "leaf-243-dense", schema: big, invalid: fill(5, 3, 42), iters: 1_000 },
];

let sink = 0;
function sampleSafe(schema: z.ZodType, input: unknown, iters: number): number {
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) {
    if (schema.safeParse(input).success) sink++;
  }
  return Number(process.hrtime.bigint() - t0) / iters;
}
function sampleRun(schema: z.ZodType, input: unknown, iters: number): number {
  const run = (schema as any)._zod.run;
  const zod = (schema as any)._zod;
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) {
    const r = run.call(zod, { value: input, issues: [] }, { async: false });
    if (r.issues.length === 0) sink++;
  }
  return Number(process.hrtime.bigint() - t0) / iters;
}

const ROUNDS = 7;
console.log("shape           issues  rt-total  rt-walk  err-cost  ceiling  dual-total  dual-walk  achieved");
for (const c of cases) {
  const dual = compile(c.schema as any) as z.ZodType;
  const rtRes = c.schema.safeParse(c.invalid) as any;
  const dualRes = dual.safeParse(c.invalid) as any;
  if (rtRes.success || dualRes.success) throw new Error(`${c.name}: expected failure`);
  if (JSON.stringify(rtRes.error.issues) !== JSON.stringify(dualRes.error.issues))
    throw new Error(`${c.name}: issue mismatch`);
  const nIssues = rtRes.error.issues.length;

  const kinds: Array<[string, () => number]> = [
    ["A", () => sampleSafe(c.schema, c.invalid, c.iters)],
    ["B", () => sampleRun(c.schema, c.invalid, c.iters)],
    ["C", () => sampleSafe(dual, c.invalid, c.iters)],
    ["D", () => sampleRun(dual, c.invalid, c.iters)],
  ];
  // warmup
  for (const [, f] of kinds) f();
  const mins = new Map<string, number>();
  for (let r = 0; r < ROUNDS; r++) {
    for (const [k, f] of kinds) {
      const v = f();
      if (!mins.has(k) || v < mins.get(k)!) mins.set(k, v);
    }
  }
  const A = mins.get("A")!;
  const B = mins.get("B")!;
  const C = mins.get("C")!;
  const D = mins.get("D")!;
  const err = A - B;
  const ceiling = A / Math.max(err, 1);
  console.log(
    `${c.name.padEnd(15)} ${String(nIssues).padStart(5)}  ${A.toFixed(0).padStart(8)}  ${B.toFixed(0).padStart(7)}  ${err.toFixed(0).padStart(8)}  ${ceiling.toFixed(2).padStart(6)}x  ${C.toFixed(0).padStart(9)}  ${D.toFixed(0).padStart(9)}  ${(A / C).toFixed(2).padStart(7)}x`
  );
}
console.log(`sink=${sink}`);
