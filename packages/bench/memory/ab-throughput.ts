import * as head from "zod";
import * as miniHead from "zod/mini";
/**
 * In-process A/B throughput. Both revisions of the zod source are loaded into
 * one process and their rounds interleaved, so machine noise (thermal, GC,
 * other processes) hits base and head equally instead of landing entirely on
 * whichever ran second.
 *
 * Prepare the base tree first:
 *   rm -rf scratch/base-src && mkdir -p scratch/base-src &&
 *   git archive <rev> packages/zod/src | tar -x -C scratch/base-src --strip-components=3
 */
import * as base from "../../../scratch/base-src/index.js";
import * as miniBase from "../../../scratch/base-src/mini/index.js";
import { table } from "./harness.js";

type Z = typeof head;
type M = typeof miniHead;

interface Case {
  label: string;
  make: (z: Z) => () => void;
}

const CASES: Case[] = [
  { label: "construct z.string()", make: (z) => () => void z.string() },
  { label: "construct z.number()", make: (z) => () => void z.number() },
  { label: "construct z.bigint()", make: (z) => () => void z.bigint() },
  {
    label: "construct z.object(3)",
    make: (z) => () => void z.object({ a: z.string(), b: z.number(), c: z.boolean() }),
  },
  { label: "construct z.array(str)", make: (z) => () => void z.array(z.string()) },
  { label: "construct .min(1)", make: (z) => () => void z.string().min(1) },
  {
    label: "construct 10-key object",
    make: (z) => () => {
      const shape: Record<string, any> = {};
      for (let k = 0; k < 10; k++) shape[`k${k}`] = z.string();
      return void z.object(shape);
    },
  },
  {
    label: "parse string",
    make: (z) => {
      const s = z.string();
      return () => void s.parse("hello");
    },
  },
  {
    label: "parse string.min",
    make: (z) => {
      const s = z.string().min(1);
      return () => void s.parse("hello");
    },
  },
  {
    label: "parse object(3)",
    make: (z) => {
      const s = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
      const d = { a: "x", b: 1, c: true };
      return () => void s.parse(d);
    },
  },
  {
    label: "safeParse object(3)",
    make: (z) => {
      const s = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
      const d = { a: "x", b: 1, c: true };
      return () => void s.safeParse(d);
    },
  },
  {
    label: "parse array(4)",
    make: (z) => {
      const s = z.array(z.string());
      const d = ["a", "b", "c", "d"];
      return () => void s.parse(d);
    },
  },
  {
    label: "parse union",
    make: (z) => {
      const s = z.union([z.string(), z.number()]);
      return () => void s.parse("hi");
    },
  },
  {
    label: "parse nested object",
    make: (z) => {
      const s = z.object({ a: z.object({ b: z.object({ c: z.string() }) }), d: z.array(z.number()) });
      const d = { a: { b: { c: "x" } }, d: [1, 2, 3] };
      return () => void s.parse(d);
    },
  },
  { label: "first .optional()", make: (z) => () => void z.string().optional() },
  { label: "first .email()", make: (z) => () => void z.string().email() },
];

// zod/mini shares the same shape of change, so it gets the same treatment.
const MINI_CASES: Array<{ label: string; make: (m: M) => () => void }> = [
  { label: "mini construct string", make: (m) => () => void m.string() },
  {
    label: "mini construct object(3)",
    make: (m) => () => void m.object({ a: m.string(), b: m.number(), c: m.boolean() }),
  },
  {
    label: "mini parse string",
    make: (m) => {
      const s = m.string();
      return () => void s.parse("hello");
    },
  },
  {
    label: "mini parse object(3)",
    make: (m) => {
      const s = m.object({ a: m.string(), b: m.number(), c: m.boolean() });
      const d = { a: "x", b: 1, c: true };
      return () => void s.parse(d);
    },
  },
  {
    label: "mini safeParse object(3)",
    make: (m) => {
      const s = m.object({ a: m.string(), b: m.number(), c: m.boolean() });
      const d = { a: "x", b: 1, c: true };
      return () => void s.safeParse(d);
    },
  },
];

function timeOnce(fn: () => void, ms: number): number {
  let ops = 0;
  const start = process.hrtime.bigint();
  const budget = BigInt(ms) * 1_000_000n;
  while (process.hrtime.bigint() - start < budget) {
    for (let i = 0; i < 200; i++) fn();
    ops += 200;
  }
  return ops / (Number(process.hrtime.bigint() - start) / 1e9);
}

const ROUNDS = 11;
const MS = 150;

const fns = [
  ...CASES.map((c) => ({ label: c.label, base: c.make(base as unknown as Z), head: c.make(head) })),
  ...MINI_CASES.map((c) => ({ label: c.label, base: c.make(miniBase as unknown as M), head: c.make(miniHead) })),
].map((c) => ({ ...c, baseSamples: [] as number[], headSamples: [] as number[] }));

for (const f of fns) {
  for (let i = 0; i < 3_000; i++) {
    f.base();
    f.head();
  }
}

for (let r = 0; r < ROUNDS; r++) {
  for (const f of fns) {
    // Alternate which side goes first each round so ordering can't bias one.
    if (r % 2 === 0) {
      f.baseSamples.push(timeOnce(f.base, MS));
      f.headSamples.push(timeOnce(f.head, MS));
    } else {
      f.headSamples.push(timeOnce(f.head, MS));
      f.baseSamples.push(timeOnce(f.base, MS));
    }
  }
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;

table(
  fns.map((f) => {
    const b = median(f.baseSamples);
    const h = median(f.headSamples);
    const delta = ((h - b) / b) * 100;
    return {
      bench: f.label,
      base: Math.round(b).toLocaleString(),
      head: Math.round(h).toLocaleString(),
      "delta%": `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`,
      verdict: delta > 5 ? "faster" : delta < -5 ? "SLOWER" : "flat",
    };
  })
);
