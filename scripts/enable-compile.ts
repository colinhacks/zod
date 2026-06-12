// Vitest setup hook for the compile-mode project. Just enables global
// compilation via the side-effect subpath module — same code path production
// users get from `import "zod/compile"`.

import "zod/compile";

// Counters exposed on globalThis so compile-stats.test.ts can verify the
// post-processor was actually wired up by the import above. The counters wrap
// the existing post-processor that `zod/compile` installed.
import * as core from "../packages/zod/src/v4/core/index.js";

interface CompileStats {
  attempts: number;
  successes: number;
  fallbacks: number;
}

const stats: CompileStats = { attempts: 0, successes: 0, fallbacks: 0 };
(globalThis as any).__zodCompileStats = stats;

const installed = core.globalConfig.postProcessor;
if (installed) {
  core.globalConfig.postProcessor = (inst: any) => {
    const before = inst._zod?.run;
    installed(inst);
    const after = inst._zod?.run;
    // If the post-processor swapped in a shim, wrap the shim to count.
    if (after && after !== before) {
      const shim = after;
      inst._zod.run = function countingShim(payload: any, ctx: any) {
        if (ctx?.async || ctx?.direction === "backward" || ctx?.skipChecks) {
          // Bypass — runs through `__originalRun` inside the shim, doesn't
          // trigger a compile attempt.
          return shim(payload, ctx);
        }
        if (inst._zod.run === countingShim) {
          stats.attempts++;
        }
        const result = shim(payload, ctx);
        // After the shim runs once, it self-replaces. If it replaced itself
        // with anything other than the original runtime, count as success;
        // if it restored the original runtime, count as fallback.
        if (inst._zod.run !== countingShim) {
          if (inst._zod.run === (shim as any).__originalRun) {
            stats.fallbacks++;
          } else {
            stats.successes++;
          }
        }
        return result;
      };
      (inst._zod.run as any).__originalRun = (shim as any).__originalRun;
    }
  };
}
