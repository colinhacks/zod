// Compares failing- and valid-parse cost across the four wrapper configurations: plain runtime, z.compile (fallback model), z.compile({issues:"single"}), z.compile({issues:"dual"}). Fixed iteration counts with gc() between samples and min-of-samples, per the benchmarking traps in AGENTS.md — failing safeParse allocates, so a time-boxed loop samples the collector instead of the code.
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

const big = nested(5, 3); // 243 leaves
const bigValid = fill(5, 3, "x");
const bigInvalid = fill(5, 3, "x") as any;
bigInvalid.k0.k0.k0.k0.k0 = 42;

const fiveKey = z.object({ a: z.string(), b: z.number(), c: z.boolean(), d: z.string(), e: z.number() });
const deep3 = z.object({ a: z.object({ b: z.object({ c: z.string() }) }) });

interface Case {
  name: string;
  schema: z.ZodType;
  valid: unknown;
  invalid: unknown;
  iters: number;
}
const cases: Case[] = [
  { name: "string", schema: z.string(), valid: "hello", invalid: 42, iters: 200_000 },
  {
    name: "object-5key",
    schema: fiveKey,
    valid: { a: "x", b: 1, c: true, d: "y", e: 2 },
    invalid: { a: "x", b: 1, c: true, d: 5, e: 2 },
    iters: 100_000,
  },
  {
    name: "nested-3deep",
    schema: deep3,
    valid: { a: { b: { c: "x" } } },
    invalid: { a: { b: { c: 42 } } },
    iters: 100_000,
  },
  {
    name: "array-20",
    schema: z.array(z.number()),
    valid: Array.from({ length: 20 }, (_, i) => i),
    invalid: Array.from({ length: 20 }, (_, i) => (i === 10 ? "x" : i)),
    iters: 50_000,
  },
  { name: "leaf-243", schema: big, valid: bigValid, invalid: bigInvalid, iters: 2_000 },
  {
    name: "tuple-4",
    schema: z.tuple([z.string(), z.number(), z.boolean(), z.string()]),
    valid: ["a", 1, true, "b"],
    invalid: ["a", "no", true, "b"],
    iters: 100_000,
  },
  {
    name: "union-3obj",
    schema: z.union([z.object({ a: z.string() }), z.object({ b: z.number() }), z.object({ c: z.boolean() })]),
    valid: { c: true },
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
    valid: { t: "b", y: 1 },
    invalid: { t: "b", y: "no" },
    iters: 100_000,
  },
];

type Variant = { name: string; schema: z.ZodType };

function variants(schema: z.ZodType): Variant[] {
  return [
    { name: "runtime ", schema },
    { name: "fallback", schema: compile(schema as any) as z.ZodType },
    { name: "single  ", schema: compile(schema as any, { issues: "single" }) as z.ZodType },
    { name: "dual    ", schema: compile(schema as any, { issues: "dual" }) as z.ZodType },
  ];
}

let sink = 0;

function sample(schema: z.ZodType, input: unknown, iters: number): number {
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) {
    const r = schema.safeParse(input);
    if (r.success) sink++;
  }
  const t1 = process.hrtime.bigint();
  return Number(t1 - t0) / iters;
}

const ROUNDS = 7;
for (const c of cases) {
  const vs = variants(c.schema);
  for (const kind of ["invalid", "valid"] as const) {
    const input = kind === "invalid" ? c.invalid : c.valid;
    // sanity: all variants agree
    const expected = c.schema.safeParse(input).success;
    for (const v of vs) {
      if (v.schema.safeParse(input).success !== expected) throw new Error(`verdict mismatch ${c.name} ${v.name}`);
    }
    const mins = new Map<string, number>(vs.map((v) => [v.name, Number.POSITIVE_INFINITY]));
    // warmup
    for (const v of vs) sample(v.schema, input, Math.max(1000, c.iters / 10));
    for (let r = 0; r < ROUNDS; r++) {
      for (const v of vs) {
        const ns = sample(v.schema, input, c.iters);
        if (ns < mins.get(v.name)!) mins.set(v.name, ns);
      }
    }
    const base = mins.get("runtime ")!;
    const line = vs
      .map((v) => `${v.name.trim()}=${mins.get(v.name)!.toFixed(0)}ns (${(base / mins.get(v.name)!).toFixed(2)}x)`)
      .join("  ");
    console.log(`${c.name.padEnd(14)} ${kind.padEnd(7)} ${line}`);
  }
}
console.log(`sink=${sink}`);
