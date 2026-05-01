import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "tests" || name === "node_modules") continue;
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) out.push(...listSourceFiles(p));
    else if (p.endsWith(".ts") && !p.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

function relativeImports(file: string): string[] {
  const src = readFileSync(file, "utf-8");
  const re = /(?:^|\n)\s*(?:import|export)[^"';\n]*from\s+["'](\.[^"']+)["']/g;
  const dir = dirname(file);
  const targets: string[] = [];
  for (const m of src.matchAll(re)) {
    targets.push(resolve(dir, m[1]!.replace(/\.js$/, ".ts")));
  }
  return targets;
}

function findCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const stack: string[] = [];
  const onStack = new Set<string>();
  const visited = new Set<string>();
  const seenCycles = new Set<string>();

  function dfs(node: string) {
    if (onStack.has(node)) {
      const i = stack.indexOf(node);
      const cycle = stack.slice(i).concat(node);
      const key = [...cycle].sort().join("|");
      if (!seenCycles.has(key)) {
        seenCycles.add(key);
        cycles.push(cycle);
      }
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    onStack.add(node);
    stack.push(node);
    for (const next of graph.get(node) ?? []) dfs(next);
    stack.pop();
    onStack.delete(node);
  }

  for (const n of graph.keys()) dfs(n);
  return cycles;
}

test("v4/classic has no circular imports (regression: #5275)", () => {
  const files = listSourceFiles(ROOT);
  const fileSet = new Set(files);
  const graph = new Map(files.map((f) => [f, relativeImports(f).filter((t) => fileSet.has(t))]));
  const cycles = findCycles(graph).map((c) => c.map((p) => relative(ROOT, p)));
  expect(cycles).toEqual([]);
});
