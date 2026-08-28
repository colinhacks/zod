// failing safeParse, zod 4.4.3 vs the current source: one process, interleaved, fixed N, gc between samples, min of rounds (node --expose-gc)
import { createRequire } from "node:module";
import path from "node:path";
import * as z45 from "zod";

// the built 4.4.3 package by absolute path: a bare "zod443" import would follow the @zod/source condition into its src, whose bare "zod/…" imports resolve to the workspace source and bench 4.5 against itself
const require = createRequire(import.meta.url);
const z44 = require(path.join(path.dirname(require.resolve("zod443/package.json")), "index.cjs"));

declare const gc: () => void;

// gc only exists under --expose-gc; pnpm bench runs plain tsx, so name the working invocation instead of dying on a bare ReferenceError
if (typeof (globalThis as any).gc !== "function") {
  throw new Error(
    "gc is not exposed — run: node --expose-gc --import tsx --conditions @zod/source packages/bench/failing-safeparse.ts"
  );
}

const shape = (z: any) => z.object({ username: z.string(), bio: z.string(), xp: z.number() });
const P44 = shape(z44);
if (require("zod443/package.json").version !== "4.4.3") throw new Error("zod443 must resolve to 4.4.3");
const P45 = shape(z45);
const bad = { username: 42, bio: "hello", xp: 12 };
if (P44.safeParse(bad).success !== false || P45.safeParse(bad).success !== false)
  throw new Error("input must fail on both");

const N = 200_000;
let sink = 0;
const time = (schema: any) => {
  gc();
  const t = process.hrtime.bigint();
  for (let i = 0; i < N; i++) sink += schema.safeParse(bad).success ? 1 : 0;
  return Number(process.hrtime.bigint() - t) / N;
};

let best44 = Number.POSITIVE_INFINITY;
let best45 = Number.POSITIVE_INFINITY;
for (let r = 0; r < 14; r++) {
  best44 = Math.min(best44, time(P44));
  best45 = Math.min(best45, time(P45));
}
console.log(
  `failing safeParse: 4.4.3 ${best44.toFixed(0)} ns, current ${best45.toFixed(0)} ns, ${(best44 / best45).toFixed(2)}x (sink ${sink})`
);
