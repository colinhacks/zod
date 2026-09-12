// speedup of z.compile() vs the standard parser as a schema grows: key count, tuple size, nesting depth
import * as z from "zod";

type Row = { label: string; runtime: z.ZodType; input: unknown };
const rows: Row[] = [];
for (const n of [1, 5, 10, 20, 50]) {
  const shape = Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, z.string()]));
  rows.push({
    label: `object, ${n} keys`,
    runtime: z.object(shape),
    input: Object.fromEntries(Object.keys(shape).map((k) => [k, "v"])),
  });
}
for (const n of [1, 3, 5, 10]) {
  rows.push({
    label: `tuple, ${n} items`,
    runtime: z.tuple(Array.from({ length: n }, () => z.string()) as any),
    input: Array.from({ length: n }, () => "v"),
  });
}
for (const d of [1, 2, 3, 5]) {
  let s: z.ZodType = z.object({ leaf: z.string() });
  let v: any = { leaf: "v" };
  for (let i = 1; i < d; i++) {
    s = z.object({ child: s, leaf: z.string() });
    v = { child: v, leaf: "v" };
  }
  rows.push({ label: `nested, depth ${d}`, runtime: s, input: v });
}

const sink: unknown[] = [];
function time(fn: () => unknown, iters: number): number {
  let best = Number.POSITIVE_INFINITY;
  for (let r = 0; r < 7; r++) {
    const t = process.hrtime.bigint();
    for (let i = 0; i < iters; i++) sink[i & 7] = fn();
    best = Math.min(best, Number(process.hrtime.bigint() - t));
  }
  return best / iters;
}

const cases = rows.map((r) => ({ ...r, compiled: z.compile(r.runtime), inputs: [r.input, structuredClone(r.input)] }));
for (const c of cases)
  for (let i = 0; i < 2000; i++) {
    c.runtime.safeParse(c.inputs[i & 1]);
    c.compiled.safeParse(c.inputs[i & 1]);
  }
console.log("| schema | standard | compiled | speedup |\n| --- | --- | --- | --- |");
for (const c of cases) {
  const iters = 20_000;
  let a = Number.POSITIVE_INFINITY;
  let b = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 3; round++) {
    a = Math.min(
      a,
      time(() => c.runtime.safeParse(c.inputs[round & 1]), iters)
    );
    b = Math.min(
      b,
      time(() => c.compiled.safeParse(c.inputs[round & 1]), iters)
    );
  }
  console.log(`| ${c.label} | ${a.toFixed(0)} ns | ${b.toFixed(0)} ns | ${(a / b).toFixed(1)}x |`);
}
