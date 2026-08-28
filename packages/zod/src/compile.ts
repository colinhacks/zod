// Side-effect-only: installs the post-processor on `globalConfig`. Listed in `package.json`'s `sideEffects`, and nothing else references it, so apps that never import it drop the compiler.
//
// Usage:
//
//   import "zod/compile";
//   import * as z from "zod";
//   // every schema constructed below this is compiled on first parse
//
// Module evaluation order matters: schemas constructed in modules that evaluate before this import will not be compiled. Place this import in the app entry point, before any module that constructs schemas at top level.
//
// Failure handling: if the compiler refuses a schema (async refinement, unsupported feature, etc.) the shim permanently restores the runtime `_zod.run` for that schema. The schema continues to work via the regular runtime parser — no observable difference to the caller.

import { compile } from "./v4/core/compile.js";
import * as core from "./v4/core/index.js";

let compiling = false;

core.globalConfig.postProcessor = (inst: any) => {
  if (compiling) return;
  const originalRun = inst._zod?.run;
  if (typeof originalRun !== "function") return;

  const shim = (payload: any, ctx: any): any => {
    // Bypass the fast path for any non-forward / non-sync / check-skipping call. The runtime owns those contracts.
    if (ctx?.async || ctx?.direction === "backward" || ctx?.skipChecks) {
      return originalRun(payload, ctx);
    }

    compiling = true;
    try {
      // Respect the jitless config: it exists precisely so CSP/no-eval environments never reach `new Function`. Global mode must not bypass it (explicit z.compile calls remain an explicit opt-in).
      if (core.globalConfig.jitless) {
        inst._zod.run = originalRun;
        return originalRun(payload, ctx);
      }
      // Strict: the shim owns its own fallback below, and a non-strict compile would hand back `inst` — whose run is this shim — and reinstall it on itself.
      const compiled = compile(inst, { strict: true });
      // Only the run wrapper. Copying the compiled parse/safeParse closures would make their fallback re-enter this instance and run user callbacks a third time.
      inst._zod.run = compiled._zod.run;
      inst._zod.bag.fallbackRun = compiled._zod.bag.fallbackRun;
      inst._zod.bag.validator = compiled._zod.bag.validator;
    } catch {
      // Permanent fallback for unsupported schemas.
      inst._zod.run = originalRun;
    } finally {
      compiling = false;
    }

    return inst._zod.run(payload, ctx);
  };

  // Expose the pre-shim runtime so `compile()` invoked elsewhere can unwrap past the shim and capture the source-of-truth runtime. Without this, a user calling `z.compile(s)` after global mode is enabled would capture the shim itself, which would feed the wrapper into itself on fallback.
  (shim as any).__originalRun = originalRun;

  inst._zod.run = shim;
};
