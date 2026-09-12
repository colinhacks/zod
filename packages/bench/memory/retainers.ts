/**
 * Walks a V8 heap snapshot and reports, for every node kind that scales with
 * the live schema population, the exact edge path that retains it.
 *
 * The population is anchored under a single global array so the walk has a
 * known root; paths are reported relative to one sample instance.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as v8 from "node:v8";

declare const gc: (() => void) | undefined;

interface RawSnapshot {
  snapshot: {
    meta: { node_fields: string[]; node_types: (string[] | string)[]; edge_fields: string[]; edge_types: string[][] };
    node_count: number;
    edge_count: number;
  };
  nodes: number[];
  edges: number[];
  strings: string[];
}

export interface Graph {
  count: number;
  type: (i: number) => string;
  name: (i: number) => string;
  selfSize: (i: number) => number;
  /** [toNodeIndex, edgeType, edgeNameOrIndex][] */
  edgesOf: (i: number) => Array<{ to: number; type: string; name: string }>;
}

export function loadGraph(file: string): Graph {
  const snap: RawSnapshot = JSON.parse(fs.readFileSync(file, "utf8"));
  const meta = snap.snapshot.meta;
  const nf = meta.node_fields;
  const ef = meta.edge_fields;
  const nStride = nf.length;
  const eStride = ef.length;

  const nTypeIdx = nf.indexOf("type");
  const nNameIdx = nf.indexOf("name");
  const nSizeIdx = nf.indexOf("self_size");
  const nEdgeCountIdx = nf.indexOf("edge_count");
  const eTypeIdx = ef.indexOf("type");
  const eNameIdx = ef.indexOf("name_or_index");
  const eToIdx = ef.indexOf("to_node");

  const nodeTypes = meta.node_types[nTypeIdx] as string[];
  const edgeTypes = meta.edge_types[eTypeIdx] as string[];
  const { nodes, edges, strings } = snap;
  const count = snap.snapshot.node_count;

  // Prefix-sum of edge counts so edges of node i are locatable in O(1).
  const edgeStart = new Uint32Array(count + 1);
  for (let i = 0; i < count; i++) {
    edgeStart[i + 1] = edgeStart[i]! + nodes[i * nStride + nEdgeCountIdx]!;
  }

  return {
    count,
    type: (i) => nodeTypes[nodes[i * nStride + nTypeIdx]!]!,
    name: (i) => strings[nodes[i * nStride + nNameIdx]!]!,
    selfSize: (i) => nodes[i * nStride + nSizeIdx]!,
    edgesOf: (i) => {
      const out: Array<{ to: number; type: string; name: string }> = [];
      for (let e = edgeStart[i]!; e < edgeStart[i + 1]!; e++) {
        const base = e * eStride;
        const type = edgeTypes[edges[base + eTypeIdx]!]!;
        const nameOrIndex = edges[base + eNameIdx]!;
        out.push({
          to: edges[base + eToIdx]! / nStride,
          type,
          // Element/hidden edges carry a numeric index; others carry a string id.
          name: type === "element" || type === "hidden" ? String(nameOrIndex) : (strings[nameOrIndex] ?? "?"),
        });
      }
      return out;
    },
  };
}

export function snapshotNow(tag: string): string {
  if (typeof gc !== "function") throw new Error("run with --expose-gc");
  for (let i = 0; i < 6; i++) gc();
  const file = path.join(os.tmpdir(), `zod-ret-${tag}-${process.pid}.heapsnapshot`);
  v8.writeHeapSnapshot(file);
  return file;
}

/**
 * BFS outward from `roots`, recording for each visited node the shortest edge
 * path that reached it. Nodes in `stopAt` are not traversed through.
 */
export function shortestPaths(g: Graph, roots: number[], maxDepth = 12): Map<number, string[]> {
  const paths = new Map<number, string[]>();
  let frontier = roots.slice();
  for (const r of roots) paths.set(r, []);

  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const next: number[] = [];
    for (const from of frontier) {
      const fromPath = paths.get(from)!;
      for (const e of g.edgesOf(from)) {
        if (paths.has(e.to)) continue;
        if (e.type === "weak") continue;
        paths.set(e.to, [...fromPath, `${e.type === "element" ? `[${e.name}]` : e.name}`]);
        next.push(e.to);
      }
    }
    frontier = next;
  }
  return paths;
}

export function findNodes(g: Graph, pred: (i: number) => boolean): number[] {
  const out: number[] = [];
  for (let i = 0; i < g.count; i++) if (pred(i)) out.push(i);
  return out;
}
