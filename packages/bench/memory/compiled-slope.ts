// Retained heap PER compiled schema, measured as a slope over many distinct schemas in one process. compiled-footprint.ts holds one instance per process and reports the delta, which also carries one-time costs of whatever the measured schema touched first (lazily compiled compiler functions, prototype members materialized on first read, a regex's first executions); those move the single-instance rows by a few KB between builds while the per-schema cost is unchanged. Distinct key names per schema keep V8's compilation cache from sharing generated source.
import * as z from "zod";
import { compile } from "../../zod/src/v4/core/compile.js";
import { fmtBytes, heapUsed } from "./harness.js";

const fiveKey = (p: string) =>
  z.object({
    [`${p}a`]: z.string(),
    [`${p}b`]: z.number(),
    [`${p}c`]: z.boolean(),
    [`${p}d`]: z.string(),
    [`${p}e`]: z.number(),
  });
function nested(depth: number, fanout: number, p: string): z.ZodType {
  if (depth === 0) return z.string();
  const shape: Record<string, z.ZodType> = {};
  for (let i = 0; i < fanout; i++) shape[`${p}${i}`] = nested(depth - 1, fanout, p);
  return z.object(shape);
}
const rejected = (schema: z.ZodType) => {
  schema.safeParse(undefined);
  return schema;
};

const hold: unknown[] = [];
(globalThis as { __hold?: unknown[] }).__hold = hold;

function slope(label: string, make: (p: string) => unknown, n: number): void {
  hold.length = 0;
  // warm-up instances absorb the one-time costs
  for (let i = 0; i < 3; i++) hold.push(make(`w${i}_`));
  const before = heapUsed();
  for (let i = 0; i < n; i++) hold.push(make(`m${i}_`));
  const per = (heapUsed() - before) / n;
  console.log(`${label.padEnd(40)} ${fmtBytes(per).padStart(10)} per schema`);
}

slope("5-key constructed", fiveKey, 50);
slope("5-key compiled", (p) => compile(fiveKey(p) as never), 50);
slope("5-key compiled, rejected once", (p) => rejected(compile(fiveKey(p) as never)), 50);
slope("243-leaf constructed", (p) => nested(5, 3, p), 8);
slope("243-leaf compiled", (p) => compile(nested(5, 3, p) as never), 8);
slope("243-leaf compiled, rejected once", (p) => rejected(compile(nested(5, 3, p) as never)), 8);
