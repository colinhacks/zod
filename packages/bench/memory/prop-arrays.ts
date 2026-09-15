/**
 * Attributes `(object properties)` backing stores to the objects that own
 * them. These showed up as the single largest line in the per-instance
 * breakdown, so this answers *whose* they are and how big.
 */
import * as fs from "node:fs";
import * as z from "zod";
import { fmtBytes, table } from "./harness.js";
import { loadGraph, snapshotNow } from "./retainers.js";

const which = process.argv[2] ?? "string";
const factories: Record<string, () => unknown> = {
  string: () => z.string(),
  "string-min": () => z.string().min(1),
  "object-3": () => z.object({ a: z.string(), b: z.number(), c: z.boolean() }),
  number: () => z.number(),
};

const N = 5_000;
const sink: unknown[] = [];
for (let i = 0; i < N; i++) sink.push(factories[which]!());

const file = snapshotNow("props");
const g = loadGraph(file);

// For every node that owns an "(object properties)" child, record the owner's kind and the child's size.
const byOwner = new Map<string, { count: number; bytes: number }>();
for (let i = 0; i < g.count; i++) {
  for (const e of g.edgesOf(i)) {
    if (e.type !== "internal" || e.name !== "properties") continue;
    const child = e.to;
    if (g.name(child) !== "(object properties)") continue;
    const key = `${g.type(i)}::${g.name(i)}`;
    let rec = byOwner.get(key);
    if (!rec) {
      rec = { count: 0, bytes: 0 };
      byOwner.set(key, rec);
    }
    rec.count++;
    rec.bytes += g.selfSize(child);
  }
}

const rows = [...byOwner.entries()]
  .map(([owner, r]) => ({
    owner,
    count: r.count,
    "per schema": (r.count / N).toFixed(2),
    "total bytes": r.bytes,
    "avg size": fmtBytes(r.bytes / r.count),
    "bytes/schema": (r.bytes / N).toFixed(0),
  }))
  .filter((r) => r.count >= N * 0.2)
  .sort((a, b) => Number(b["bytes/schema"]) - Number(a["bytes/schema"]));

console.log(`(object properties) backing stores, ${which}, n=${N}\n`);
table(rows);
console.log(`\ntotal: ${rows.reduce((s, r) => s + Number(r["bytes/schema"]), 0).toFixed(0)} bytes/schema`);

if (sink.length !== N) throw new Error("unreachable");
fs.unlinkSync(file);
