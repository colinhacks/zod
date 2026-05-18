// Side-effect-only module: enables AOT compilation for every schema constructed
// after this import. The only operation is installing a post-processor on
// `globalConfig`. Bundlers preserve this import because the file is listed in
// `package.json`'s `sideEffects` array; nothing else in `zod` references it,
// so apps that don't `import "zod/compile"` drop the entire compiler.
//
// Usage:
//
//   import "zod/compile";
//   import * as z from "zod";
//   // every schema constructed below this is compiled on first parse
//
// Module evaluation order matters: schemas constructed in modules that
// evaluate before this import will not be compiled. Place this import in the
// app entry point, before any module that constructs schemas at top level.
//
// Failure handling: if `compile()` throws for a schema (async refinement,
// unsupported feature, etc.) the shim catches and permanently restores the
// runtime `_zod.run` for that schema. The schema continues to work via the
// regular runtime parser — no observable difference to the caller.

import { compile } from "./v4/core/compile.js";
import * as core from "./v4/core/index.js";

let compiling = false;

core.globalConfig.postProcessor = (inst: any) => {
  if (compiling) return;
  const originalRun = inst._zod?.run;
  if (typeof originalRun !== "function") return;

  const shim = (payload: any, ctx: any): any => {
    // Bypass the fast path for any non-forward / non-sync / check-skipping
    // call. The runtime owns those contracts.
    if (ctx?.async || ctx?.direction === "backward" || ctx?.skipChecks) {
      return originalRun(payload, ctx);
    }

    compiling = true;
    try {
      const compiled = compile(inst);
      inst._zod.run = compiled._zod.run;
    } catch {
      // Permanent fallback for unsupported schemas.
      inst._zod.run = originalRun;
    } finally {
      compiling = false;
    }

    return inst._zod.run(payload, ctx);
  };

  // Expose the pre-shim runtime so `compile()` invoked elsewhere can unwrap
  // past the shim and capture the source-of-truth runtime. Without this, a
  // user calling `z.compile(s)` after global mode is enabled would capture
  // the shim itself, which would feed the wrapper into itself on fallback.
  (shim as any).__originalRun = originalRun;

  inst._zod.run = shim;
};
