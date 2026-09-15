/**
 * Attributes per-instance heap cost by diffing two V8 heap snapshots: one with
 * a baseline population of schemas live, one with `delta` more. Grouping the
 * difference by node type/name shows exactly which allocations scale with the
 * number of schemas.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as v8 from "node:v8";

declare const gc: (() => void) | undefined;

interface Snapshot {
  snapshot: {
    meta: {
      node_fields: string[];
      node_types: (string[] | string)[];
      edge_fields: string[];
      edge_types: (string[] | string)[];
    };
    node_count: number;
    edge_count: number;
  };
  nodes: number[];
  edges: number[];
  strings: string[];
}

export interface NodeRow {
  type: string;
  name: string;
  selfSize: number;
}

function collect(): void {
  if (typeof gc !== "function") throw new Error("run with --expose-gc");
  for (let i = 0; i < 6; i++) gc();
}

function takeSnapshot(tag: string): string {
  collect();
  const file = path.join(os.tmpdir(), `zod-mem-${tag}-${process.pid}.heapsnapshot`);
  v8.writeHeapSnapshot(file);
  return file;
}

function readNodes(file: string): NodeRow[] {
  const snap: Snapshot = JSON.parse(fs.readFileSync(file, "utf8"));
  const { node_fields, node_types } = snap.snapshot.meta;
  const typeIdx = node_fields.indexOf("type");
  const nameIdx = node_fields.indexOf("name");
  const sizeIdx = node_fields.indexOf("self_size");
  const stride = node_fields.length;
  const typeNames = node_types[typeIdx] as string[];
  const { nodes, strings } = snap;

  const out: NodeRow[] = new Array(snap.snapshot.node_count);
  for (let i = 0, n = 0; i < nodes.length; i += stride, n++) {
    out[n] = {
      type: typeNames[nodes[i + typeIdx]!]!,
      name: strings[nodes[i + nameIdx]!]!,
      selfSize: nodes[i + sizeIdx]!,
    };
  }
  return out;
}

function key(r: NodeRow): string {
  return `${r.type}::${r.name}`;
}

function tally(rows: NodeRow[]): Map<string, { count: number; bytes: number }> {
  const m = new Map<string, { count: number; bytes: number }>();
  for (const r of rows) {
    const k = key(r);
    let e = m.get(k);
    if (!e) {
      e = { count: 0, bytes: 0 };
      m.set(k, e);
    }
    e.count++;
    e.bytes += r.selfSize;
  }
  return m;
}

export interface DiffRow {
  what: string;
  count: number;
  bytes: number;
  countEach: number;
  bytesEach: number;
}

/**
 * Runs `factory` `delta` extra times on top of `baseline` live instances and
 * reports which node kinds grew, normalized per added instance.
 */
export function diffAllocation(factory: () => unknown, baseline = 2_000, delta = 8_000): DiffRow[] {
  const sink: unknown[] = [];
  for (let i = 0; i < baseline; i++) sink.push(factory());

  const fileA = takeSnapshot("a");
  const before = tally(readNodes(fileA));
  fs.unlinkSync(fileA);

  for (let i = 0; i < delta; i++) sink.push(factory());

  const fileB = takeSnapshot("b");
  const after = tally(readNodes(fileB));
  fs.unlinkSync(fileB);

  if (sink.length !== baseline + delta) throw new Error("unreachable");

  const rows: DiffRow[] = [];
  for (const [k, a] of after) {
    const b = before.get(k) ?? { count: 0, bytes: 0 };
    const dCount = a.count - b.count;
    const dBytes = a.bytes - b.bytes;
    // Ignore noise that doesn't scale with the population.
    if (dCount < delta * 0.2) continue;
    rows.push({
      what: k,
      count: dCount,
      bytes: dBytes,
      countEach: dCount / delta,
      bytesEach: dBytes / delta,
    });
  }
  rows.sort((x, y) => y.bytes - x.bytes);
  return rows;
}
