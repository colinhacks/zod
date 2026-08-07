/**
 * Dumps the full retained object graph of ONE schema instance: every node
 * reachable from it that isn't also reachable from module-level state, with
 * the property path that retains it.
 *
 * Usage: node --expose-gc --import tsx anatomy.ts [case]
 */
import * as fs from "node:fs";
import * as z from "zod";
import { fmtBytes, table } from "./harness.js";
import { findNodes, loadGraph, shortestPaths, snapshotNow } from "./retainers.js";

const cases: Record<string, () => unknown> = {
  string: () => z.string(),
  number: () => z.number(),
  "object-empty": () => z.object({}),
  "object-3": () => z.object({ a: z.string(), b: z.number(), c: z.boolean() }),
  "string-min": () => z.string().min(1),
};

const which = process.argv[2] ?? "string";
const factory = cases[which]!;
if (!factory) {
  console.error(`unknown case; try ${Object.keys(cases).join(", ")}`);
  process.exit(1);
}

// A uniquely-named holder makes the anchor easy to find in the snapshot.
const ZOD_MEMORY_PROBE_ANCHOR: unknown[] = [factory()];
(globalThis as any).ZOD_MEMORY_PROBE_ANCHOR = ZOD_MEMORY_PROBE_ANCHOR;

const file = snapshotNow("anatomy");
const g = loadGraph(file);

// Locate the anchor by the globally-unique property name, then the schema it holds.
let anchorArray = -1;
outer: for (const i of findNodes(g, () => true)) {
  for (const e of g.edgesOf(i)) {
    if (e.name === "ZOD_MEMORY_PROBE_ANCHOR") {
      anchorArray = e.to;
      break outer;
    }
  }
}
if (anchorArray < 0) {
  console.error("anchor not found in snapshot");
  process.exit(1);
}

// The element may hang off the array directly or off its backing store.
function firstElement(node: number): number {
  for (const e of g.edgesOf(node)) {
    if (e.type === "element") return e.to;
  }
  for (const e of g.edgesOf(node)) {
    if (e.type === "internal") {
      for (const inner of g.edgesOf(e.to)) if (inner.type === "element") return inner.to;
    }
  }
  return -1;
}

const schemaNode = firstElement(anchorArray);
if (schemaNode < 0) {
  console.error("schema instance not found under anchor");
  process.exit(1);
}

console.log(`anatomy of a single ${which} — root node: ${g.type(schemaNode)}::${g.name(schemaNode)}\n`);

const paths = shortestPaths(g, [schemaNode], 8);

// Everything reachable, grouped by path prefix depth 1-3, excluding the huge
// shared module graph (heuristic: skip anything reached via a prototype edge
// or a shared context, which fan out into the whole program).
const rows: Array<{ path: string; kind: string; bytes: number }> = [];
for (const [node, p] of paths) {
  if (p.length === 0) continue;
  if (p.length > 4) continue;
  if (p.some((seg) => seg === "__proto__" || seg === "map" || seg === "prototype")) continue;
  rows.push({ path: p.join(" → "), kind: `${g.type(node)}::${g.name(node)}`, bytes: g.selfSize(node) });
}
rows.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path));

table(rows.slice(0, 70).map((r) => ({ path: r.path, node: r.kind, bytes: r.bytes, human: fmtBytes(r.bytes) })));

const closures = rows.filter((r) => r.kind.startsWith("closure::"));
console.log(`\nreachable within depth 4: ${rows.length} nodes, ${fmtBytes(rows.reduce((s, r) => s + r.bytes, 0))}`);
console.log(`of which closures: ${closures.length}, ${fmtBytes(closures.reduce((s, r) => s + r.bytes, 0))}`);

fs.unlinkSync(file);
