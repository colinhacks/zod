// Where the time goes when a caller reads `.error` on a failing safeParse: finalizeIssue per issue, the ZodError construction, and the plain Error baseline. Fixed iterations, gc between samples, min of 7 interleaved rounds.
import * as z from "zod";
import * as core from "../zod/src/v4/core/index.js";
import * as util from "../zod/src/v4/core/util.js";

declare global {
  var gc: undefined | (() => void);
}
if (!globalThis.gc) {
  console.error("run with --expose-gc");
  process.exit(1);
}

const inst = z.string();
const raw = () => ({ code: "invalid_type", expected: "string", input: 42, inst }) as unknown as core.$ZodRawIssue;
const ctx = { async: false } as core.ParseContextInternal;
const finalized = util.finalizeIssue(raw(), ctx, core.config());
const finalizedList = [finalized];

let sink = 0;
function sample(fn: () => unknown, iters: number): number {
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) if (fn()) sink++;
  return Number(process.hrtime.bigint() - t0) / iters;
}

// candidate finalizeIssue bodies, same output: object rest (shipped) vs an explicit copy loop
const SKIP = new Set(["inst", "schema", "continue", "input"]);
function finalizeLoop(iss: any, c: any, cfg: any): any {
  const traits: Set<string> | undefined = iss.inst?._zod?.traits;
  if (traits?.has("$ZodType")) {
    if (traits.has("$ZodCheck")) iss.schema ??= iss.inst;
    else iss.schema = iss.inst;
  }
  const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
  const message = iss.message
    ? iss.message
    : (util.unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
      util.unwrapMessage(schemaError?.(iss)) ??
      util.unwrapMessage(c?.error?.(iss)) ??
      util.unwrapMessage(cfg.customError?.(iss)) ??
      util.unwrapMessage(cfg.localeError?.(iss)) ??
      "Invalid input");
  const out: any = {};
  for (const k in iss) if (!SKIP.has(k)) out[k] = iss[k];
  out.path ??= [];
  out.message = message;
  if (c?.reportInput) out.input = iss.input;
  return out;
}
const localeError = core.config().localeError!;

const variants: Array<[string, () => unknown]> = [
  ["finalizeIssue: copy loop variant", () => finalizeLoop(raw(), ctx, core.config())],
  ["localeError(raw) alone", () => localeError(raw() as never)],
  [
    "object rest of a raw issue",
    () => {
      const { inst: _i, schema: _s, continue: _c, input: _n, ...rest } = raw() as any;
      return rest;
    },
  ],
  ["finalizeIssue(one raw issue)", () => util.finalizeIssue(raw(), ctx, core.config())],
  ["config() alone", () => core.config()],
  ["new Error('x')", () => new Error("x")],
  ["new core.$ZodRealError([issue])", () => new core.$ZodRealError(finalizedList)],
  ["new z.ZodError([issue]) (classic)", () => new z.ZodError(finalizedList)],
  ["new z.ZodError + read .issues", () => new z.ZodError(finalizedList).issues],
  ["new z.ZodError + read .message", () => new z.ZodError(finalizedList).message.length],
  ["safeParse(42).error.issues.length", () => (inst.safeParse(42) as any).error.issues.length],
];
const ITERS = 300_000;
const mins = new Map<string, number>();
for (const [, fn] of variants) sample(fn, ITERS / 10);
for (let r = 0; r < 7; r++) {
  for (const [name, fn] of variants) {
    const v = sample(fn, ITERS);
    if (!mins.has(name) || v < mins.get(name)!) mins.set(name, v);
  }
}
for (const [name] of variants) console.log(`${name.padEnd(38)} ${mins.get(name)!.toFixed(1)} ns`);
console.log(`sink=${sink}`);
