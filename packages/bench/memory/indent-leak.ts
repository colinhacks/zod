// What a runtime island used to cost the generated source. Before #6570 `Doc.indented` decremented only on a normal return, so a child that threw `ZodCompileUnsupportedError` left the level raised: `compileChild` catches that throw, emits an island and keeps writing, and every later line sat one level deeper. N islands therefore emitted O(N²) leading spaces, and `new Function` retains the source. The leaky `indented` is restored onto the prototype here rather than compared across two checkouts, so the A/B stays exact and reproducible now that only the fixed revision exists — nothing else about codegen changed, and `sameModuloIndent` asserts it per row.
import * as z from "zod";
import { Doc, compileFn } from "zod/v4/core";
import { fmtBytes, heapUsed } from "./harness.js";

const balanced = Doc.prototype.indented;
function leaky(this: Doc, fn: (doc: Doc) => void) {
  this.indent += 1;
  fn(this);
  this.indent -= 1;
}

function withLeak<T>(on: boolean, fn: () => T): T {
  Doc.prototype.indented = on ? (leaky as typeof balanced) : balanced;
  try {
    return fn();
  } finally {
    Doc.prototype.indented = balanced;
  }
}

// distinct key names per schema so V8's compilation cache never shares generated source between instances
const branch = (p: string, i: number, islands: number) => {
  const shape: Record<string, z.ZodType> = { [`${p}kind`]: z.literal(`${p}k${i}`) };
  for (let j = 0; j < islands; j++) shape[`${p}n${j}`] = z.coerce.number().nullable();
  shape[`${p}tail`] = z.string();
  return z.object(shape);
};
const union = (p: string, branches: number, islands: number) =>
  z.discriminatedUnion(`${p}kind`, Array.from({ length: branches }, (_, i) => branch(p, i, islands)) as never);

/** The `// Constants:` header debug mode prepends is not part of what `new Function` receives. */
const source = (schema: z.ZodType) => compileFn(schema, { debug: true }).code!.replace(/^\/\/ Constants:.*\n/, "");
const leading = (code: string) => code.split("\n").reduce((a, l) => a + (l.length - l.trimStart().length), 0);
const sameModuloIndent = (a: string, b: string) => {
  const strip = (s: string) => s.replace(/^[ ]+/gm, "");
  return strip(a) === strip(b);
};

// median, not minimum: a heap delta is noisy in BOTH directions — an unrelated collection inside the window makes a pass read low — so the smallest pass is as wrong as the largest. Taking minima put a 39 KB reading on a row whose true retention is ~75 KB.
function retainedMedian(make: (p: string) => z.ZodType, n: number, leak: boolean, passes: number): number {
  const samples = Array.from({ length: passes }, () => retained(make, n, leak)).sort((a, b) => a - b);
  return samples[samples.length >> 1]!;
}

// every schema in the process gets its own key namespace: a repeated prefix means byte-identical generated source, which V8's compilation cache then shares, and the second pass measures a cache hit rather than a compile
let nsCounter = 0;

/** Retained bytes per compiled function: the schemas are built and held before the baseline, so only the compile lands in the delta. */
function retained(make: (p: string) => z.ZodType, n: number, leak: boolean): number {
  const schemas = Array.from({ length: n + 2 }, () => make(`m${nsCounter++}_`));
  const hold: unknown[] = [];
  (globalThis as { __hold?: unknown[] }).__hold = hold;
  withLeak(leak, () => {
    for (let i = 0; i < 2; i++) hold.push(compileFn(schemas[i]!)); // warm-up absorbs one-time compiler costs
  });
  const before = heapUsed();
  withLeak(leak, () => {
    for (let i = 2; i < schemas.length; i++) hold.push(compileFn(schemas[i]!));
  });
  const per = (heapUsed() - before) / n;
  if (hold.length !== schemas.length || schemas.length !== n + 2) throw new Error("unreachable");
  hold.length = 0;
  return per;
}

const PASSES = Number(process.env.PASSES ?? 5);

const CASES: Array<{ label: string; branches: number; islands: number; n: number }> = [
  { label: "162 branches, no islands", branches: 162, islands: 0, n: 12 },
  { label: "10 branches, 20 islands", branches: 10, islands: 2, n: 40 },
  { label: "25 branches, 50 islands", branches: 25, islands: 2, n: 24 },
  { label: "50 branches, 100 islands", branches: 50, islands: 2, n: 16 },
  { label: "100 branches, 200 islands", branches: 100, islands: 2, n: 12 },
  { label: "162 branches, 324 islands", branches: 162, islands: 2, n: 10 },
];

for (const c of CASES) {
  const make = (p: string) => union(p, c.branches, c.islands) as unknown as z.ZodType;
  const probe = make("p_");
  const leakedCode = withLeak(true, () => source(probe));
  const fixedCode = withLeak(false, () => source(probe));
  if (!sameModuloIndent(leakedCode, fixedCode)) throw new Error(`${c.label}: codegen differs beyond indentation`);

  const row = {
    label: c.label,
    branches: c.branches,
    islands: c.branches * c.islands,
    leakedBytes: leakedCode.length,
    fixedBytes: fixedCode.length,
    leakedLeadingBytes: leading(leakedCode),
    fixedLeadingBytes: leading(fixedCode),
    leakedRetained: Math.round(retainedMedian(make, c.n, true, PASSES)),
    fixedRetained: Math.round(retainedMedian(make, c.n, false, PASSES)),
  };
  console.log(`ROW ${JSON.stringify(row)}`);
  console.log(
    `  ${c.label.padEnd(26)} source ${fmtBytes(row.fixedBytes).padStart(9)} vs ${fmtBytes(row.leakedBytes).padStart(9)}   retained ${fmtBytes(row.fixedRetained).padStart(9)} vs ${fmtBytes(row.leakedRetained).padStart(9)}`
  );
}
