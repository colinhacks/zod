import * as z from "zod";
import { fmtBytes, table } from "./harness.js";
import { diffAllocation } from "./snapshot.js";

const which = process.argv[2] ?? "string";

const factories: Record<string, () => unknown> = {
  string: () => z.string(),
  number: () => z.number(),
  "object-empty": () => z.object({}),
  "object-3": () => z.object({ a: z.string(), b: z.number(), c: z.boolean() }),
  "string-min": () => z.string().min(1),
  optional: () => z.string().optional(),
  union: () => z.union([z.string(), z.number()]),
  array: () => z.array(z.string()),
};

const factory = factories[which];
if (!factory) {
  console.error(`unknown case "${which}"; try: ${Object.keys(factories).join(", ")}`);
  process.exit(1);
}

const rows = diffAllocation(factory, 2_000, 8_000);
const total = rows.reduce((sum, r) => sum + r.bytesEach, 0);

console.log(`allocation breakdown for ${which} (per instance)\n`);
table(
  rows.map((r) => ({
    node: r.what,
    "per inst": r.countEach.toFixed(2),
    bytes: r.bytesEach.toFixed(0),
    human: fmtBytes(r.bytesEach),
  }))
);
console.log(`\ntotal attributed: ${fmtBytes(total)}`);
