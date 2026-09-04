// Retained heap for ONE compiled schema, each case in its own process: what z.compile adds on top of construction, with and without the compiled issue path. Many identical schemas in one process share their generated source through V8's compilation cache, which hides the per-schema cost `measureStable` would otherwise report, so this spawns a child per case instead. Run under --expose-gc; compare against the same script on the baseline checkout.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as z from "zod";
import { compile } from "../../zod/src/v4/core/compile.js";
import { fmtBytes, heapUsed, table } from "./harness.js";

function nested(depth: number, fanout: number): z.ZodType {
  if (depth === 0) return z.string();
  const shape: Record<string, z.ZodType> = {};
  for (let i = 0; i < fanout; i++) shape[`k${i}`] = nested(depth - 1, fanout);
  return z.object(shape);
}
const fiveKey = () => z.object({ a: z.string(), b: z.number(), c: z.boolean(), d: z.string(), e: z.number() });
const big = () => nested(5, 3);

// the issue parser compiles on the first rejection, so the "rejected once" rows hold what a schema that has failed at least once retains. `issues: false` is unknown to the baseline compiler, which ignores the option; its rows then read like the plain compiled ones there
const rejected = (schema: z.ZodType) => {
  schema.safeParse(undefined);
  return schema;
};
const cases: Record<string, () => unknown> = {
  "5-key constructed": fiveKey,
  "5-key compiled": () => compile(fiveKey() as never),
  "5-key compiled, rejected once": () => rejected(compile(fiveKey() as never)),
  "5-key compiled, issues:false, rejected once": () => rejected(compile(fiveKey() as never, { issues: false } as never)),
  "243-leaf constructed": big,
  "243-leaf compiled": () => compile(big() as never),
  "243-leaf compiled, rejected once": () => rejected(compile(big() as never)),
  "243-leaf compiled, issues:false, rejected once": () => rejected(compile(big() as never, { issues: false } as never)),
};

const which = process.argv[2];
if (which) {
  // child: warm the module state with a schema of a DIFFERENT shape (identical generated source would be served from V8's compilation cache and its string shared), then hold one instance and report the delta. One sample per process; the parent takes the median of several children.
  const factory = cases[which]!;
  const sink: unknown[] = [];
  (globalThis as { __sink?: unknown[] }).__sink = sink;
  sink.push(compile(z.object({ warm: z.string(), up: z.number() }) as never));
  sink.length = 0;
  const before = heapUsed();
  sink.push(factory());
  const after = heapUsed();
  process.stdout.write(String(after - before));
} else {
  const self = fileURLToPath(import.meta.url);
  const rows = Object.keys(cases).map((label) => {
    const samples: number[] = [];
    for (let r = 0; r < 5; r++) {
      const c = spawnSync(process.execPath, ["--expose-gc", "--import", "tsx", "--conditions=@zod/source", self, label], {
        encoding: "utf8",
      });
      if (c.status !== 0) throw new Error(`${label}: ${c.stderr}`);
      samples.push(Number(c.stdout.trim()));
    }
    samples.sort((a, b) => a - b);
    const bytes = samples[Math.floor(samples.length / 2)]!;
    return { schema: label, bytes: bytes.toFixed(0), human: fmtBytes(bytes) };
  });
  table(rows);
}
