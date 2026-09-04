// Where a compiled failing walk spends its time on the shapes that sit below their ceiling: the fast parser's rejection, the issue parser's walk, and the cold call that produces one issue. Fixed iterations, gc between samples, min of 7 interleaved rounds.
import * as z from "zod";
import { INVALID, coldParse, compileFn } from "../zod/src/v4/core/compile.js";

declare global {
  var gc: undefined | (() => void);
}
if (!globalThis.gc) {
  console.error("run with --expose-gc");
  process.exit(1);
}

interface Case {
  name: string;
  schema: z.ZodType;
  valid: unknown;
  invalid: unknown;
  iters: number;
}
const cases: Case[] = [
  {
    name: "nested-3deep",
    schema: z.object({ a: z.object({ b: z.object({ c: z.string() }) }) }),
    valid: { a: { b: { c: "ok" } } },
    invalid: { a: { b: { c: 42 } } },
    iters: 200_000,
  },
  {
    name: "array-20",
    schema: z.array(z.number()),
    valid: Array.from({ length: 20 }, (_, i) => i),
    invalid: Array.from({ length: 20 }, (_, i) => (i === 10 ? "x" : i)),
    iters: 100_000,
  },
  {
    name: "tuple-4",
    schema: z.tuple([z.string(), z.number(), z.boolean(), z.string()]),
    valid: ["a", 1, true, "b"],
    invalid: ["a", "no", true, "b"],
    iters: 200_000,
  },
];

let sink = 0;
function sample(fn: () => unknown, iters: number): number {
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) if (fn()) sink++;
  return Number(process.hrtime.bigint() - t0) / iters;
}
function minOf(variants: Array<[string, () => unknown]>, iters: number): Map<string, number> {
  const mins = new Map<string, number>();
  for (const [, fn] of variants) sample(fn, iters / 10);
  for (let r = 0; r < 7; r++) {
    for (const [name, fn] of variants) {
      const v = sample(fn, iters);
      if (!mins.has(name) || v < mins.get(name)!) mins.set(name, v);
    }
  }
  return mins;
}

for (const c of cases) {
  const fast = compileFn(c.schema as never) as (v: unknown) => unknown;
  const issues = compileFn(c.schema as never, { issues: true } as never) as unknown as (
    v: unknown,
    p: { value: unknown; issues: unknown[] },
    ctx: undefined
  ) => unknown;
  const run = c.schema._zod.run as (p: { value: unknown; issues: unknown[] }, ctx: object) => { issues: unknown[] };
  const ctx = {};
  const mins = minOf(
    [
      ["fast, valid input", () => fast(c.valid) !== INVALID],
      ["fast, invalid input (rejects)", () => fast(c.invalid) === INVALID],
      ["issue parser, valid input", () => issues(c.valid, { value: c.valid, issues: [] }, undefined) !== INVALID],
      [
        "issue parser, invalid input",
        () => {
          const p = { value: c.invalid, issues: [] as unknown[] };
          issues(c.invalid, p, undefined);
          return p.issues.length === 1;
        },
      ],
      ["runtime _zod.run, invalid input", () => run({ value: c.invalid, issues: [] }, ctx).issues.length === 1],
    ],
    c.iters
  );
  console.log(c.name);
  for (const [name, v] of mins) console.log(`  ${name.padEnd(32)} ${v.toFixed(1)} ns`);
}

// one issue's cold call against an inline push of the same raw shape (what a hand-built leaf site would cost)
const str = z.string();
const strParse = str._zod.parse as never;
const path = ["a", "b", "c"];
const micro = minOf(
  [
    [
      "coldParse(42, string) + path",
      () => {
        const p = { value: 42, issues: [] as unknown[] };
        coldParse(42, strParse, p as never, undefined, path);
        return p.issues.length === 1;
      },
    ],
    [
      "inline push of the raw issue",
      () => {
        const p = { value: 42, issues: [] as unknown[] };
        p.issues.push({ expected: "string", code: "invalid_type", input: 42, inst: str, path: [...path] });
        return p.issues.length === 1;
      },
    ],
    [
      "string._zod.parse alone",
      () => {
        const p = { value: 42, issues: [] as unknown[] };
        str._zod.parse(p as never, {} as never);
        return p.issues.length === 1;
      },
    ],
  ],
  300_000
);
console.log("one issue");
for (const [name, v] of micro) console.log(`  ${name.padEnd(32)} ${v.toFixed(1)} ns`);
console.log(`sink=${sink}`);
