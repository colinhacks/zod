# z.compile implementation + test plan

Plan to land everything in `wiki/compile.md`. Phases are ordered by dependency; each phase ends in a green test suite. Items within a phase are roughly commit-sized.

## Current status

Track per-phase. Update as work lands. If context compresses, the next agent reads this section first.

- **Phase 1** — complete. `compile()` now returns a cloned schema with replaced `_zod.run`. Fast path delegates to the *original* schema's `_zod.run` on bypass (backward/async/skipChecks) and on `INVALID` fallback — this preserves `inst` references so error messages match. `compileFastpass()` exposed internally for direct fast-path use (Phase 2 will use it). Eager async detection throws `ZodCompileAsyncError` for `.refine`/`.transform`/overwrite/pipe-transform/custom-fn. Tests migrated to schema API. Full repo suite: 4055/4055 passing.
- **Phase 2** — complete. `compile-differential.test.ts` runs ~50 fixture sets across every supported combinator and asserts byte-equal data on success, deep-equal `issues` on failure. Surfaced and fixed three real divergences: (1) `z.number()` accepting `Infinity` (compile used `!Number.isNaN` but runtime uses `Number.isFinite`); (2) codec transforms (`z.stringbool`) accessing `payload.issues.push` — pipe codegen now spoofs a payload and forces fallback on any pushed issue; (3) records with enum/literal keys (`z.record(z.enum([...]), v)`) lacked exhaustiveness — compile now forces fallback for that case, dynamic-key records still take the fast path. Full repo suite: 4157/4157 passing.
- **Phase 2b** — complete. Dual-suite verification via a separate `vitest.compile.config.ts` invoked by `pnpm test:compile`. Setup file `scripts/enable-compile.ts` installs the global post-processor (lazy-shim, reentrancy-guarded, exposes pre-shim runtime via `__originalRun`). Constructor hook in `core/core.ts` calls `globalConfig.postProcessor?.(inst)`. `compile-stats.test.ts` verifies the post-processor is wired up. Critical fix surfaced and made: compile()'s wrapper must capture `schema._zod.run` *eagerly* and unwrap past any installed shim — lazy capture caused infinite recursion when the shim self-replaced. `pnpm test` (default) stays fully green; `pnpm test:compile` has 50 known failures across feature areas tracked as Phase 4 work (see "Phase 4 punch list" below).
- **Phase 3** — complete. `packages/zod/src/compile.ts` is the side-effect-only subpath module that installs the global post-processor. `package.json` exposes it as `./compile` (with `@zod/source`/`import`/`require`/`types` conditions) and lists the file in `sideEffects` so bundlers preserve it under `import "zod/compile"` but tree-shake when not imported. `scripts/enable-compile.ts` now collapses to a thin wrapper around `import "zod/compile"` plus a counting overlay for the dual-suite stats test. New `compile-global.test.ts` validates the user-facing subpath import path. Full suite: 4165 default + same 50 known compile-mode divergences. Tree-shaking verification via a bundle fixture deferred to Phase 5.
- **Phase 4** — complete. Both suites green: default 4161/4161, compile-mode 2134/2134. Every schema in the existing test corpus produces byte-identical output under global compile mode as under the runtime parser. Added `ZodCompileUnsupportedError` and made the compile pass throw it (forcing fallback) for: intersection, prefault, url/httpurl/base64/base64url/jwt formats, url options (normalize/hostname/protocol), z.xor, default-wrapping-transform/pipe, optional-wrapping-default, exactOptional, tuple items with default/prefault wrappers, partial. Fixed real codegen bugs: `z.number()` accepting `Infinity`, dynamic-record-key not validating keys, record using `typeof === "object"` instead of `isPlainObject` (Date acceptance regression), object output always including absent optional keys, object missing presence check for required keys, mini-style number formats (int/int32/uint32/float32) with format inlined into schema def, readonly not freezing output.
- **Phase 5** — in progress. `play.ts` restored to its main-branch content. `packages/bench/compile.ts` updated to the new schema-returning API and confirms the perf claim: AOT raw fast path runs at **22.5x** Zod non-JIT / **5.5x** Zod JIT; the wrapped `compiled.safeParse()` (the public API) runs at **15.6x** Zod non-JIT / **3.8x** Zod JIT on the moltar fixture. The wrapper costs ~30% vs the raw fast path, mainly `ParsePayload` protocol overhead. `AGENTS.md` (mirrored to `CLAUDE.md` and `.cursorrules`) now lists `pnpm test:compile`. README copy + bundle-size tree-shaking verification pending.

Live commits on this branch (newest first):
- `36225b9f` wiki: capture z.compile design decisions
- `a9e28f0d` wiki: implementation + test plan for z.compile
- `ac063f28` WIP: hoist util.floatSafeRemainder in compiled multipleOf
- `30d3aaf7` WIP: align compile with main behaviors
- `3539cfc1` WIP
- `7e64b278` WIP

## Phase 1 — Convert `compile()` to schema-clone + fallback

The current branch returns `((input) => T | INVALID) & { code: string }`. We need it to return a cloned schema with a replaced `_zod.run` that calls the compiled fast path first and falls back to the original `_zod.run` on `INVALID`. This is the largest single change in the plan and rewrites the existing test suite's call sites.

- [ ] Add `compileFastpass(schema)` (renamed internal) that returns the existing `(input) => T | INVALID` function. Same body as today's exported `compile`. This is the lower-level primitive everything else builds on.
- [ ] Reimplement `compile(schema)` to:
  1. Clone the schema via the existing `util.clone` machinery (verify it produces a usable schema graph snapshot, doesn't shallow-share `_zod`).
  2. Generate `fast = compileFastpass(clone)` at call time.
  3. Replace `clone._zod.run` with a wrapper:
     ```ts
     const originalRun = clone._zod.run;
     clone._zod.run = (payload, ctx) => {
       if (ctx?.direction === "backward" || ctx?.async) return originalRun(payload, ctx);
       const out = fast(payload.value);
       if (out !== INVALID) {
         payload.value = out;
         return payload;
       }
       return originalRun(payload, ctx);
     };
     ```
  4. Return `clone` (typed as the same `ZodType` as input).
- [ ] Detect async at compile-walk time (already partial — `isAsyncFunction` checks) and throw a single named error class `ZodCompileAsyncError` so callers can `try/catch` cleanly.
- [ ] Update `core/index.ts` exports: drop `INVALID` from the public surface (it's now an internal implementation detail of the wrapper). Keep it exported from `compile.ts` for internal use.
- [ ] Migrate `packages/zod/src/v4/core/tests/compile.test.ts`:
  - Replace the `compile(schema)` → function pattern with `compile(schema).safeParse(input)` everywhere.
  - Rewrite `valid()` / `invalid()` helpers to assert on `SafeParseResult` shape.
  - Verify that error cases now produce real `ZodError`s with paths matching the runtime (this is implicit because we fall back).

**Test surface for this phase:**

- All 228 existing compile tests pass with the new API shape.
- Add `compile-fallback.test.ts`: explicit assertions that errors thrown from the compiled wrapper are byte-identical to errors from the original schema's `safeParse` (issue codes, paths, messages).
- Add `compile-snapshot.test.ts`: explicit assertion that the original schema is unchanged after `z.compile` — same `_zod.run` reference, no leaked mutations.
- Add `compile-direction.test.ts`: `z.compile(z.codec(...)).safeParse(x)` and `.encode(x)` both produce the same outputs as the original schema (the encode path goes through the fallback).

## Phase 2 — Differential testing

We claim success-path output parity by construction-plus-tests, not by construction alone. We need a real test harness that catches output divergence between the compiled fast path and the runtime.

- [ ] Add `packages/zod/src/v4/core/tests/compile-differential.test.ts` with a fixture-driven harness:
  ```ts
  function differential(schema: z.ZodType, inputs: unknown[]) {
    const compiled = z.compile(schema);
    for (const input of inputs) {
      const r1 = schema.safeParse(input);
      const r2 = compiled.safeParse(input);
      expect(r2.success).toBe(r1.success);
      if (r1.success) expect(r2.data).toEqual(r1.data);
      else expect(r2.error.issues).toEqual(r1.error.issues);
    }
  }
  ```
- [ ] Build a fixture matrix: for each supported schema type, a representative schema plus an inputs array covering valid, invalid, boundary, and weird (NaN, `__proto__`, prototype-polluted, symbol keys, sparse arrays, holes, etc.).
- [ ] Add nested-composition fixtures: arrays of objects of unions of records, tuples with rest of arrays of optionals with defaults, deeply nested codec chains, etc. These are where output divergence is most likely.
- [ ] Wire the harness into `pnpm test`.

**Acceptance:** the differential harness passes for every schema combinator that compile supports. Any combinator that fails should either be fixed in the compiler or removed from the supported list (and the schema-walk should refuse to install the fast path for it).

## Phase 3 — Subpath + global mode

- [ ] Add a new subpath module. Working name: `packages/zod/src/v4/classic/external-compile.ts` (or similar location that doesn't get pulled in by the main `zod/v4` barrel). The module body is exactly one statement that sets `globalConfig.postProcessor = compile`. Nothing else exported.
- [ ] Add `"./compile"` to `packages/zod/package.json` `exports` field pointing at the built location.
- [ ] Set `sideEffects` in `packages/zod/package.json` to a list. Default the whole package to `sideEffects: false`, with the compile subpath module explicitly listed. Test against esbuild + Vite + Rollup that dead-code elimination works (a fixture app that imports `zod` but not `zod/compile` should not include `compile.ts` in the output).
- [ ] Add `postProcessor?: (schema: SomeType) => void` to `globalConfig` in `core/core.ts`. Document as internal.
- [ ] Modify the `_` constructor function in `core/core.ts` to call `globalConfig.postProcessor?.(inst)` after the `_zod.deferred` flush.
- [ ] Implement the post-processor itself (the function the subpath module installs): it installs a one-shot shim that compiles on first parse.
  ```ts
  function postProcess(inst: SomeType) {
    if (compiling) return;
    const originalRun = inst._zod.run;
    inst._zod.run = (payload, ctx) => {
      compiling = true;
      try {
        const compiled = compile(inst);
        inst._zod.run = compiled._zod.run; // overwrite self
      } finally {
        compiling = false;
      }
      return inst._zod.run(payload, ctx);
    };
  }
  ```
- [ ] Add the reentrancy guard (`compiling` flag) and verify with a test that `z.compile(z.object({ a: z.string() }))` doesn't loop forever even with global mode enabled.
- [ ] Ensure `import "zod/compile"` is idempotent — repeated imports don't install the post-processor twice (the assignment is a no-op the second time, which is fine; just verify).

**Test surface:**

- Add `compile-global.test.ts`: import the subpath, construct a schema, parse, verify output matches uncompiled. Crucially, the test file needs to be isolated (own vitest worker) because it mutates global state.
- Bundle-size sanity test: a fixture script that imports `zod` only, vs one that imports `zod` + `zod/compile`. Built artifact size should differ by the compile.ts footprint. Lock with a tolerance assertion.

## Phase 4 — Bug fixes pending from main divergence audit

These came out of the earlier review and aren't yet fixed:

- [ ] **Record key schema transforms** (#5891). Two options: (a) detect any check/transform on the key schema and skip the fast path entirely for that record (simplest, slowest); (b) run the key schema at compile time once per known key and emit the transformed output key (preserves fast path for enum/literal keys with transforms). Recommend (b) for enum/literal key schemas, (a) otherwise.
- [ ] **Record symbol keys** (#5719). Compile uses `for...in`, which iterates enumerable string keys only. Runtime uses `Reflect.ownKeys` to support symbol keys. Either match (loop with `Reflect.ownKeys` + `propertyIsEnumerable`) or document the gap. Recommend match — symbol keys in records are obscure but supported.
- [ ] **base64 / base64url** double-check. Hoist `util.isValidBase64` / `util.isValidBase64URL` via `addConstant` and call as a second check after the regex pattern. Prevents the next #5888-style regex/runtime drift.
- [ ] **Discriminated union optimization.** Specialized `generateDiscriminatedUnionCheck` that extracts the discriminator key value, looks up the matching branch in a hoisted Map, validates only that branch. Fallback to plain union traversal if discriminator value is missing or unknown.

**Test surface:** regression test per fix, plus differential matrix coverage.

## Phase 5 — Polish + release prep

- [ ] Remove `play.ts` changes from the WIP commits before opening the PR (it's user scratch, doesn't belong on the branch).
- [ ] Drop the `.code` property from compiled functions (or gate it behind a `{ debug: true }` option in `compile()`). It's useful for development but bloats memory in production.
- [ ] Verify `pnpm build` produces a clean ESM bundle and that the `zod/compile` subpath resolves correctly under both `import` and `require` conditions.
- [ ] Run the full repo test suite (`pnpm vitest run`), not just compile-related tests.
- [ ] Run `pnpm check:semver` + the rest of the prepublish gates.
- [ ] Verify dts emit: the cloned-schema return type from `compile<T>(s: T): T` should preserve `T` exactly, with no widening or branding.
- [ ] Run the benches in `packages/bench/compile-*.ts`. Confirm the schema-wrapper overhead hasn't eroded the headline 8x figure significantly. If it has, profile and reduce wrapper cost (likely candidates: `Object.assign` of `_zod`, indirect-call cost of the wrapper function vs direct compiled fn).
- [ ] Update `AGENTS.md` with a one-line note that `z.compile` exists and the subpath enables it globally.
- [ ] Decide on README copy. Probably one short section under "Performance" with an example, a perf number, and a link to the wiki doc.

## Things explicitly out of scope for v1

For the record, so the PR review doesn't relitigate these:

- Dual codegen (Allows + Apply) for the error path. Not needed; fallback gives us parity.
- Backward-direction (encode) fast path. Forward only.
- Compile in CSP / jitless environments. Explicit opt-in to `new Function`.
- Public `globalConfig.postProcessor`. Internal.
- Multiple registered post-processors / plugin hooks. Single slot.
- Async support. Throws at compile time, deliberately.
- Function-returning `compile()`. Returns a schema.

## Definition of done

- All five phases land in their own commits (or commit groups), no force-pushes that lose history.
- Differential harness is green across the full combinator matrix.
- Bundle-size test confirms tree-shaking works in real bundlers.
- Benches confirm the schema-wrapper overhead is in single-digit %, not 2x.
- The wiki page (`wiki/compile.md`) matches the shipped behavior.
- A short README + AGENTS.md mention exists.
- The PR description links to the wiki page and lists what's intentionally out of scope.

## Force-fallback cases (Phase 4 outcome)

The compile pass throws `ZodCompileUnsupportedError` at codegen time for the schemas/features below. The global shim (and `import "zod/compile"`) catches it and permanently restores the runtime `_zod.run` for that schema. Direct `z.compile(schema)` callers see the throw and should not be compiling that schema. None of these affect *correctness* — runtime semantics are preserved by construction.

Future work would re-add fast-path codegen for these, ideally one bucket per PR with focused benches.

- **Intersection** — runtime does deep recursive merge of overlapping object/array values and rejects incompatible merges. Worth a specialized codegen if intersections show up in perf-critical paths.
- **prefault** — runs the default value through the inner schema (`z.string().trim().prefault("  x  ")` trims to `"x"`). Doable with codegen that recursively invokes inner check on the default-constant.
- **default wrapping transform/pipe** — default fires when the *transformed* value is undefined, not the input. Same shape as prefault, needs codegen-time hand-off.
- **optional wrapping default** — runtime applies the default through the optional wrapper. Currently we skip inner entirely if input is undefined.
- **exactOptional** — distinguishes absent vs explicit-undefined; fast path can't tell.
- **Tuple items that fill a missing slot** (default/prefault inside the item's wrapper chain) — output-shaping rules are subtle (dense vs truncated). Tuple-with-default is rare enough that fallback is fine.
- **z.xor** — exclusive-union requires exactly-one-match; fast path's first-match-wins semantics would silently accept multi-match.
- **String formats with runtime checks beyond their pattern**: `url`, `httpurl`, `base64`, `base64url`, `jwt`. All have `_zod.check` machinery (whitespace rejection, atob validation, JWT structural checks, URL normalization/options) that the pattern doesn't model.
- **`url` options** — `normalize`, `hostname`, `protocol` flags on a url schema.

Detection lives in `packages/zod/src/v4/core/compile.ts` — search for `ZodCompileUnsupportedError`.

## Still-open polish (Phase 5)

- **Discriminated-union optimization** (specialized branch lookup vs sequential IIFE). Largest remaining single perf opportunity. Not a correctness issue; just leaves throughput on the floor for DU-heavy schemas.
- **Record key schema transforms** (`#5891`): records with enum/literal keys force fallback today. Could re-add a codegen that runs the key schema per-known-key and uses the transformed value as the output property name.
- **Record symbol keys**: runtime uses `Reflect.ownKeys`; compile uses `for...in` (enumerable-string-only). Documented gap; affects ~nobody.
- **base64 / base64url runtime double-check** as a belt-and-suspenders future-proof against another #5888-style regex/runtime drift. Currently we force-fallback for both; an explicit double-check would let the fast path handle them.
- **Bench parity** — run `packages/bench/compile-*.ts` to confirm the schema-wrapper + force-fallback overhead hasn't eroded the 8x figure significantly.
- **Tree-shaking verification** — a small bundle fixture proving `zod/compile` is dropped when not imported.
