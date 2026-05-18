// Vitest setup hook that enables AOT compilation for every schema constructed
// after this file loads. Used by the `compile-mode` project to re-run the full
// test suite under global compile, verifying success-path agreement between the
// compiled fast path and the runtime parser.
//
// Once the `zod/compile` subpath ships (phase 3), this file collapses to:
//   import "zod/compile";

import { compile } from "../packages/zod/src/v4/core/compile.js";
import * as core from "../packages/zod/src/v4/core/index.js";

interface CompileStats {
  attempts: number;
  successes: number;
  fallbacks: number;
}

const stats: CompileStats = { attempts: 0, successes: 0, fallbacks: 0 };
// Exposed on globalThis so the verification test can read it from a separate
// test file (vitest's `isolate: true` resets module-local state per file, but
// `globalThis` persists across the project's worker pool lifetime).
(globalThis as any).__zodCompileStats = stats;

// Reentrancy guard. `compile()` clones the input schema, which constructs a
// new instance, which re-fires the post-processor. The guard short-circuits
// that recursion.
let compiling = false;

core.globalConfig.postProcessor = (inst: any) => {
  if (compiling) return;

  const originalRun = inst._zod?.run;
  if (typeof originalRun !== "function") return;

  const shim = (payload: any, ctx: any) => {
    // Modes the fast path can't model: defer immediately and don't compile.
    if (ctx?.async || ctx?.direction === "backward" || ctx?.skipChecks) {
      return originalRun(payload, ctx);
    }

    stats.attempts++;
    compiling = true;
    try {
      const compiled = compile(inst);
      // Replace this shim with the compiled wrapper. Subsequent calls through
      // inst._zod.run go directly to the compiled wrapper, bypassing the shim
      // entirely (including any closures that still hold the shim reference,
      // because they re-dispatch through inst._zod.run below).
      inst._zod.run = compiled._zod.run;
      stats.successes++;
    } catch {
      // Permanent fallback: schema contains something the compiler doesn't
      // support (async, custom $ZodType extension, etc.). Restore the runtime
      // so future calls don't keep paying the compile attempt.
      inst._zod.run = originalRun;
      stats.fallbacks++;
    } finally {
      compiling = false;
    }

    return inst._zod.run(payload, ctx);
  };

  // Expose the pre-shim runtime so `compile()` (called from anywhere — by the
  // user, by us during a fallback, etc.) can unwrap past the shim and capture
  // the source-of-truth runtime instead of feeding itself.
  (shim as any).__originalRun = originalRun;

  inst._zod.run = shim;
};
