# z.compile implementation + test plan

Plan to land everything in `wiki/compile.md`. Phases are ordered by dependency; each phase ends in a green test suite. Items within a phase are roughly commit-sized.

## Current status

Track per-phase. Update as work lands. If context compresses, the next agent reads this section first.

- **Phase 1** — complete. `compile()` now returns a cloned schema with replaced `_zod.run`. Fast path delegates to the *original* schema's `_zod.run` on bypass (backward/async/skipChecks) and on `INVALID` fallback — this preserves `inst` references so error messages match. `compileFastpass()` exposed internally for direct fast-path use (Phase 2 will use it). Eager async detection throws `ZodCompileAsyncError` for `.refine`/`.transform`/overwrite/pipe-transform/custom-fn. Tests migrated to schema API. Full repo suite: 4055/4055 passing.
- **Phase 2** — complete. `compile-differential.test.ts` runs ~50 fixture sets across every supported combinator and asserts byte-equal data on success, deep-equal `issues` on failure. Surfaced and fixed three real divergences: (1) `z.number()` accepting `Infinity` (compile used `!Number.isNaN` but runtime uses `Number.isFinite`); (2) codec transforms (`z.stringbool`) accessing `payload.issues.push` — pipe codegen now spoofs a payload and forces fallback on any pushed issue; (3) records with enum/literal keys (`z.record(z.enum([...]), v)`) lacked exhaustiveness — compile now forces fallback for that case, dynamic-key records still take the fast path. Full repo suite: 4157/4157 passing.
- **Phase 2b** — complete. Dual-suite verification via a separate `vitest.compile.config.ts` invoked by `pnpm test:compile`. Setup file `scripts/enable-compile.ts` installs the global post-processor (lazy-shim, reentrancy-guarded, exposes pre-shim runtime via `__originalRun`). Constructor hook in `core/core.ts` calls `globalConfig.postProcessor?.(inst)`. `compile-stats.test.ts` verifies the post-processor is wired up. Critical fix surfaced and made: compile()'s wrapper must capture `schema._zod.run` *eagerly* and unwrap past any installed shim — lazy capture caused infinite recursion when the shim self-replaced. `pnpm test` (default) stays fully green; `pnpm test:compile` has 50 known failures across feature areas tracked as Phase 4 work (see "Phase 4 punch list" below).
- **Phase 3** — complete. `packages/zod/src/compile.ts` is the side-effect-only subpath module that installs the global post-processor. `package.json` exposes it as `./compile` (with `@zod/source`/`import`/`require`/`types` conditions) and lists the file in `sideEffects` so bundlers preserve it under `import "zod/compile"` but tree-shake when not imported. `scripts/enable-compile.ts` now collapses to a thin wrapper around `import "zod/compile"` plus a counting overlay for the dual-suite stats test. New `compile-global.test.ts` validates the user-facing subpath import path. Full suite: 4165 default + same 50 known compile-mode divergences. Tree-shaking verification via a bundle fixture deferred to Phase 5.
- **Phase 4** — complete. Both suites green: default and compile-mode. Every schema in the existing test corpus produces byte-identical output under global compile mode as under the runtime parser. Added `ZodCompileUnsupportedError` and made the compile pass throw it (forcing fallback) for truly unsupported shapes. Since then several earlier fallbacks have been implemented: intersection, prefault, z.xor, URL/base64/JWT string formats, optional-wrapping-default/prefault, tuple missing-slot defaults/prefaults, exhaustive records with key transforms, record symbol keys, and exactOptional top-level/object-property behavior. Fixed real codegen bugs: `z.number()` accepting `Infinity`, dynamic-record-key not validating keys, record using `typeof === "object"` instead of `isPlainObject` (Date acceptance regression), object output always including absent optional keys, object missing presence check for required keys, mini-style number formats (int/int32/uint32/float32) with format inlined into schema def, readonly not freezing output.
- **Phase 5** — effectively complete except for the explicit API decision on tree-shaking vs top-level `z.compile`. `play.ts` restored to its main-branch content. `packages/bench/compile.ts` updated to the new schema-returning API. `packages/bench/compile-vs-arktype.ts` updated to compare `z.compile().safeParse`, `compileFastpass`, arktype, handwritten, and regular Zod sequentially. `compile()` now installs fast `parse`/`safeParse` closures on the cloned schema, and global mode copies those closures onto the original schema after lazy compile. This removes most of the public-wrapper overhead. Current arktype benchmark results: simple object `z.compile().safeParse` **27.0M ops/sec** vs arktype **34.4M**; nested moltar object **15.9M** vs arktype **17.2M**; array of 100 numbers **8.75M** vs arktype **15.4M**; array of 50 objects **3.99M** vs arktype **4.62M**. Discriminated-union fast path added and benchmarked: 3-branch DU `z.compile().safeParse` **27.0M ops/sec** vs arktype **23.9M** (raw fast path **34.5M**). Added `packages/bench/compile-helper-scope.ts` and moved base64/base64url/JWT from force-fallback to hoisted runtime helpers. Helper-call benchmark: base64url compiled `.safeParse` **5.45k ops/sec** vs runtime zod `.safeParse` **4.74k**; JWT compiled **4.56k** vs runtime **4.09k**. Added `packages/bench/compile-base64-inline-vs-hoist.ts` for single-string signal: valid `z.base64()` manual hoisted helper **10.6M ops/sec**, manual inline body **10.1M**, compileFastpass **10.4M**, compiled `.safeParse` **9.36M**, runtime `.safeParse` **8.13M**. This confirms hoisted helper calls are not measurably slower than duplicating the base64 body inline on the success path. Invalid-input `.safeParse` remains slow by design because it falls back to runtime to build canonical errors. Scoped-constant-count benchmark: unused scoped constants do not materially affect runtime, but construction cost scales (~1.51M ops/sec with one helper, ~969k with helper+10 constants, ~369k with helper+50 constants), so selective hoisting remains the policy for generated-function cleanliness (construction cost itself is not a release concern). `AGENTS.md` (mirrored to `CLAUDE.md` and `.cursorrules`) now lists `pnpm test:compile`. README copy added. `pnpm build`, `pnpm test`, and `pnpm test:compile` all pass; ATTW snapshot updated for `zod/compile`. Bundle check found an unresolved API tradeoff: `zod/compile` side-effect module is only included when imported, but `core/compile.ts` is retained by ordinary `import * as z from "zod"` because `z.compile` is a public namespace export. True compiler tree-shaking for namespace users conflicts with top-level `z.compile`.

- **Hardening pass (June 2026)** — complete. A full adversarial evaluation (differential probes per combinator, executed repros for every claimed divergence) surfaced and fixed: lazy islands invoking the inner runtime without a ctx (TypeError on valid input for any compiled `z.lazy` tree with checks/defaults); url string-format checks assigning to const accessors (crash) and mutating caller input; `z.success` returning the inner value instead of the boolean; strict-object key-count shortcut accepting inherited enumerable keys (closed with a hoisted-prototype guard, ~2% cost); object output divergences (unknown-key order, `{k: undefined}` materialization vs the runtime's value-or-presence rule, empty-shape loose spread, multi-read getters — fixed via `mayOutputUndefined`-gated assembly and single-read property caching, net bench positive); literal-union Set optimization bypassing literal checks; sync refine returning a Promise silently passing; user callbacks running 3-4x on invalid input under global mode (now exactly 2x via a ctx fallback flag plus shim/closure changes). `z.xor` reverted to forced fallback (match counting is unsound against any falsely-rejecting branch). Custom `when`-gated checks, NaN/Invalid-Date bounds, `__proto__` shape/record keys force fallback; Date gt/lt bounds compile via hoisted constants. Error taxonomy unified: every unsupported shape throws `ZodCompileUnsupportedError` (plain-Error throws and always-INVALID emissions eliminated; `new Function` failures converted). Global mode honors `config().jitless`. Differential harness hardened: key-order/absence/frozenness/NaN-sensitive comparison plus per-fixture assertion that the fast path actually produced the value. Moltar strict-object bench after all fixes: raw fast path 44.6k ops/sec and wrapped safeParse 31.6k vs 43.6k/29.3k before the pass.

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

- [x] Remove `play.ts` changes from the WIP commits before opening the PR (it's user scratch, doesn't belong on the branch).
- [x] Drop the `.code` property from compiled functions (or gate it behind a `{ debug: true }` option in `compile()`). It's useful for development but bloats memory in production.
- [x] Verify `pnpm build` produces a clean ESM bundle and that the `zod/compile` subpath resolves correctly under both `import` and `require` conditions.
- [x] Run the full repo test suite (`pnpm vitest run`), not just compile-related tests.
- [x] Run `pnpm check:semver` + the rest of the prepublish gates.
- [x] Verify dts emit: the cloned-schema return type from `compile<T>(s: T): T` should preserve `T` exactly, with no widening or branding.
- [x] Run the benches in `packages/bench/compile-*.ts`. Confirm the schema-wrapper overhead hasn't eroded the headline 8x figure significantly. If it has, profile and reduce wrapper cost (likely candidates: `Object.assign` of `_zod`, indirect-call cost of the wrapper function vs direct compiled fn).
- [x] Update `AGENTS.md` with a one-line note that `z.compile` exists and the subpath enables it globally.
- [x] Decide on README copy. Probably one short section under "Performance" with an example, a perf number, and a link to the wiki doc.

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
- Bundle-size test documents the tree-shaking/API tradeoff: `zod/compile` side-effect module tree-shakes unless imported, but top-level `z.compile` keeps `core/compile.ts` reachable under namespace imports.
- Benches confirm the schema-wrapper overhead is in single-digit %, not 2x.
- The wiki page (`wiki/compile.md`) matches the shipped behavior.
- A short README + AGENTS.md mention exists.
- The PR description links to the wiki page and lists what's intentionally out of scope.

## Force-fallback cases (Phase 4 outcome)

The compile pass throws `ZodCompileUnsupportedError` at codegen time for the schemas/features below. The global shim (and `import "zod/compile"`) catches it and permanently restores the runtime `_zod.run` for that schema. Direct `z.compile(schema)` callers see the throw and should not be compiling that schema. None of these affect *correctness* — runtime semantics are preserved by construction.

Future work would re-add fast-path codegen for these, ideally one bucket per PR with focused benches.

- **Intersection** — done. Left/right validation is compiled, then the compiler hoists runtime `mergeValues` for the deep recursive merge. If merge fails, fast path returns `INVALID` and runtime fallback produces canonical errors. Bench: deep-merge intersection `z.compile().safeParse` **4.78M ops/sec** vs runtime **2.56M** (~1.9x).
- **prefault** — runs the default value through the inner schema (`z.string().trim().prefault("  x  ")` trims to `"x"`). Doable with codegen that recursively invokes inner check on the default-constant.
- **default wrapping transform/pipe** — default fires when the *transformed* value is undefined, not the input. Same shape as prefault, needs codegen-time hand-off.
- **optional wrapping default** — runtime applies the default through the optional wrapper. Currently we skip inner entirely if input is undefined.
- **exactOptional** — done for top-level schemas, object properties, and tuple slots. Top-level delegates to the inner schema so `undefined` rejects; object codegen routes optionality through `fastPathAcceptsAbsence`-driven presence checks plus optin/optout-aware output assembly; tuple codegen no longer force-falls-back when an item is exactOptional — the optout-tail IIFE branch swallows an INVALID from an absent slot (truncate) while the inline present branch lets the inner schema reject explicit `undefined`.
- **Tuple items that fill a missing slot** (default/prefault inside the item's wrapper chain) — output-shaping rules are subtle (dense vs truncated). Tuple-with-default is rare enough that fallback is fine.
- **z.xor** — exclusive-union requires exactly-one-match; fast path's first-match-wins semantics would silently accept multi-match.
- **String formats with custom runtime behavior** — mostly done. `url`/`httpurl`/URL options now use exported `parseValidURL` via a hoisted helper. `base64`, `base64url`, and `jwt` use hoisted runtime validators. No longer force-fallback.

Detection lives in `packages/zod/src/v4/core/compile.ts` — search for `ZodCompileUnsupportedError`.

## Still-open polish (Phase 5)

- **Discriminated-union optimization** — done. Specialized discriminator-branch codegen now runs before the generic xor fallback. Benchmark beats arktype in a 3-branch DU case.
- **Record key schema transforms** — done for exhaustive records. Codegen now iterates known key values, runs the key schema once per key, and uses the transformed key as the output property. Differential coverage added.
- **Record symbol keys** — done. Dynamic records now use `Reflect.ownKeys` + `propertyIsEnumerable`, matching runtime behavior.
- **URL/httpurl runtime helper** — done. Extracted `parseValidURL` and hoisted it in the compiler. Helper benchmark: URL compiled `.safeParse` **4.04k ops/sec** vs runtime zod `.safeParse` **3.58k**.
- **Bench parity** — run `packages/bench/compile-*.ts` to confirm the schema-wrapper + force-fallback overhead hasn't eroded the 8x figure significantly.
- **Tree-shaking/API decision** — esbuild bundle fixture shows `packages/zod/src/compile.ts` (global side-effect module) is dropped unless `import "zod/compile"` is present, but `packages/zod/src/v4/core/compile.ts` is retained by ordinary `import * as z from "zod"` because the public namespace exposes `z.compile`. To make the compiler fully tree-shakeable for namespace imports, the per-schema API would need to move off the main namespace (e.g. named export from `zod/compile`), or accept that `z.compile` trades bundle size for discoverability.

Completed polish after this list was written:

- **Record symbol keys** — done. Dynamic `z.record(z.string(), value)` now uses `Reflect.ownKeys` plus `propertyIsEnumerable` and rejects enumerable symbol keys, matching the runtime. Differential coverage added.
- **Required-key presence optimization** — done. `requiresPresenceCheck(schema)` (paired with `fastPathAcceptsAbsence`) gates the `key in input` guard on required object properties: emitted only when the child's value-level fast path would otherwise let an absent key through as `undefined` (e.g. `z.undefined()`, `z.any()`, unions containing undefined). Typed-leaf schemas like `z.string()` no longer pay for the redundant presence check.
- **Tuple exactOptional** — done. `generateTupleCheck` no longer throws `ZodCompileUnsupportedError` for exactOptional items; the existing optoutStart-tail IIFE handles absence (truncate) while the inline present-branch lets the inner schema reject explicit `undefined`. Differential and focused tests cover mixed required + exactOptional and exactOptional vs regular optional on explicit undefined.

## Phase 5 — Runtime islands + catch + IPv6 hoist

Done. Combinator codegen (`generateObjectCheck`, `generateTupleCheck`, `generateArrayCheck`, `generateRecordCheck` value-side, `generateIntersectionCheck`, and the object's catchall-with-schema path) now route each child through `compileChild`. If a child throws `ZodCompileUnsupportedError`, the doc + ctx state is rolled back and a runtime island is emitted instead — the child schema is hoisted as a constant and parsed via `runtimeRun(schema, value)` at call time. This means one unsupported leaf no longer aborts compilation of the surrounding object/tuple/array/record/intersection. Async detection at the island boundary is conservative: if `_zod.run` returns a Promise, the island returns `INVALID` and the wrapper falls back to runtime. Union / discriminated-union codegen deliberately does **not** add islands — first-match-wins semantics depend on per-option failure being a runtime parser failure, not a "couldn't compile this branch" sentinel; the simpler behavior is to keep `ZodCompileUnsupportedError` bubbling and let the global shim install runtime fallback for the entire union.

`case "catch"` added. Inner is routed through `compileChild` (so a runtime-island inner still gets catch behavior). When the inner fast path returns `INVALID`, a hoisted `runtimeCatch(inner, catchValue, value)` helper runs the inner runtime, finalizes its issues, and calls `catchValue` with a `$ZodCatchCtx`-shaped payload (`{ value, issues: [], error: { issues: finalized }, input }`). Async inner triggers fallback. `fastPathAcceptsAbsence` returns true for `catch` (the wrapper always produces an output even on an absent key).

IPv6 / CIDRv6 hoisting done in a previous commit (`isValidIPv6` / `isValidCIDRv6` exported from `core/schemas.ts`, hoisted via `addConstant` in both `generateStringCheck` and `generateStringFormatCheck`). Reclassification of the four plain-`Error` throws to `ZodCompileUnsupportedError` shipped in the same commit.

Bench delta (post-Phase 4 → post-Phase 5, all within ±5% noise):

| case | post-Phase-4 | post-this-work | delta |
| --- | --- | --- | --- |
| simple object | 26.2M | 25.9M | -1.1% |
| nested moltar | 18.8M | 19.2M | +2.1% |
| array of 100 numbers | 8.35M | 8.53M | +2.2% |
| array of 50 objects | 3.94M | 3.82M | -3.0% |
| DU 3-branch | 28.0M | 27.1M | -3.2% |
| intersection | 4.78M | 4.70M | -1.7% |


## Phase 6 — Post-launch ecosystem follow-up

Tracked outside the repo. Summary: after release, upstream compiled-variant entries to the public cross-library benchmarks and update external docs that cite Zod runtime performance numbers.
