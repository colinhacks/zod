import * as z from "zod";

const schema = z.object({ name: z.string(), age: z.number().int() });
const bad = { name: 1, age: 2.5 };
const good = { name: "a", age: 2 };
const N = 200_000;
let sink = 0;
function time(fn: () => unknown): number {
  for (let i = 0; i < 20_000; i++) sink += (fn() as any) ? 1 : 0;
  let best = Infinity;
  for (let r = 0; r < 9; r++) {
    const t = process.hrtime.bigint();
    for (let i = 0; i < N; i++) sink += (fn() as any) ? 1 : 0;
    const ns = Number(process.hrtime.bigint() - t) / N;
    if (ns < best) best = ns;
  }
  return best;
}
const cases: Record<string, () => unknown> = {
  "safeParse invalid, success only": () => schema.safeParse(bad).success,
  "safeParse invalid, .error.issues read": () => schema.safeParse(bad).error!.issues.length,
  "safeParse valid": () => schema.safeParse(good).data,
  "parse invalid, try/catch": () => {
    try {
      schema.parse(bad);
    } catch (e) {
      return (e as any).issues.length;
    }
  },
};
cases["~standard.validate invalid, issues read"] = () => (schema["~standard"].validate(bad) as any).issues.length;
cases["~standard.validate valid"] = () => (schema["~standard"].validate(good) as any).value;
const rows: Record<string, number> = {};
for (const [k, fn] of Object.entries(cases)) rows[k] = time(fn);
console.log(JSON.stringify({ tag: process.argv[2] ?? "?", rows, sink }));
