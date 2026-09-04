// Cold vs peak failing-parse cost on the 243-leaf schema, runtime vs compiled issues. V8 sizes a function's optimization budget by its bytecode, so a single huge issue parser runs unoptimized for thousands of rejections; the compiler splits subtrees over a size threshold into functions of their own so each tiers up alone. `cold` is the mean over the first COLD calls on a freshly compiled schema (a fresh schema per sample, since `new Function` shares compiled code across identical sources); `peak` is min-of-samples after 20,000 warmup calls.
import * as z from "zod";
import { compile, compileFn } from "../zod/src/v4/core/compile.js";

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
const first = fill(5, 3, "x") as any;
first.k0.k0.k0.k0.k0 = 42;
const middle = fill(5, 3, "x") as any;
middle.k1.k1.k1.k1.k1 = 42;
const last = fill(5, 3, "x") as any;
last.k2.k2.k2.k2.k2 = 42;
const valid = fill(5, 3, "x");

const code = compileFn(nested(5, 3), { issues: true, debug: true }).code!;
console.log(
  `issue parser source ${code.length} chars, hoisted functions ${code.match(/^function f\w+\(/gm)?.length ?? 0}`
);

let successes = 0;
function run(schema: z.ZodType, input: unknown, iters: number): number {
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) if (schema.safeParse(input).success) successes++;
  return Number(process.hrtime.bigint() - t0) / iters;
}

const COLD = Number(process.env.COLD ?? 2000);
const kinds = ["runtime", "compiled"] as const;
for (const [name, input] of [
  ["first", first],
  ["middle", middle],
  ["last", last],
  ["valid", valid],
] as const) {
  const cold = { runtime: Number.POSITIVE_INFINITY, compiled: Number.POSITIVE_INFINITY };
  const peak = { runtime: Number.POSITIVE_INFINITY, compiled: Number.POSITIVE_INFINITY };
  for (let r = 0; r < 5; r++) {
    for (const kind of kinds) {
      const schema = kind === "runtime" ? nested(5, 3) : (compile(nested(5, 3)) as z.ZodType);
      globalThis.gc!();
      cold[kind] = Math.min(cold[kind], run(schema, input, COLD));
      run(schema, input, 20_000);
      for (let s = 0; s < 5; s++) {
        globalThis.gc!();
        peak[kind] = Math.min(peak[kind], run(schema, input, 2000));
      }
    }
  }
  const fmt = (t: { runtime: number; compiled: number }) =>
    `runtime=${t.runtime.toFixed(0)}ns compiled=${t.compiled.toFixed(0)}ns (${(t.runtime / t.compiled).toFixed(2)}x)`;
  console.log(`${name.padEnd(7)} cold(${COLD}) ${fmt(cold)}   peak ${fmt(peak)}`);
}
console.log(`(${successes} successful parses consumed)`);
