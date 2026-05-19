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

## Phase 6 — Post-launch ecosystem PRs

Action plan to ship in the week after `z.compile` lands on npm. Items are roughly priority-ordered within each section: §6.1 upstream benchmark PRs first (canonical citations), §6.2 competitor doc PRs (where Zod-perf claims are quoted publicly), §6.3 internal docs, §6.4 adjacent ecosystem (only verified cases), §6.5 social acknowledgements, §6.6 our own launch artifacts.

The PR voice across all external repos: ego-free, factual, "Zod 4 now ships an opt-in AOT compiler that closes this gap on X cases — adding a variant / updating the comparison to reflect both modes." Most maintainers will accept; some won't; either is fine.

### 6.1 — Benchmark repos (upstream `zod-compiled` variant)

1. **`open-circle/schema-benchmarks`** — `schemas/libraries/zod/benchmarks.ts`. Add a third parsing variant alongside the existing `safeParse` + `jitless` entries, plus install `zod/compile` once at module load. The repo already discriminates variants via `optimizeType` (typia uses `"precompiled"`); add `optimizeType: "compile"` and a `note: "compile"` parsing entry. There is already an empty `schemas/libraries/zod/download_compiled/` directory in the tree, so the maintainers (Fabian Hiller + EskiMojo14) have likely anticipated this — coordinate via issue first to confirm shape, then PR. Same patch the in-flight bench worker is producing locally can serve as the basis. Quote the current shape from `benchmarks.ts`: `parsing: { allErrors: [ { run(data) { return schema.safeParse(data); }, ... }, { run(data) { return schema.safeParse(data, { jitless: true }); }, ... note: "jitless", optimizeType: "none" } ] }` — append a third entry returning `compiledSchema.safeParse(data)`. *Why:* this is the canonical cross-library bench (18 libs, daily-updated, cited by `valibot.dev` and several blog posts). Without a compiled variant, every external citation of "Zod runtime perf" will keep pointing at the un-compiled number. *PR shape:* small, but needs a 5-minute issue thread with the maintainers first to confirm whether `compile` is a `note` on the existing zod entry or a separate `zod-compiled` library row. *Open question:* whether `import "zod/compile"` global mode is fair game in a shared-process bench (could leak compilation across libraries via the constructor hook) — recommend the explicit `z.compile(schema)` shape per-entry instead.

2. **`moltar/typescript-runtime-type-benchmarks`** — `cases/zod4.ts`. Already pulls `zod@next` via `"zod4": "npm:zod@next"` in `package.json`, so once `z.compile` is on npm the bump is mechanical. Add a `cases/zod4-compiled.ts` mirroring the existing four cases (`parseSafe`, `parseStrict`, `assertLoose`, `assertStrict`) but with `z.compile(dataType)` inside the factory. *Why:* this is the bench that ArkType's homepage chart sources from (`arktype.io` "20x faster than Zod4" — see §6.2.1). Until a compiled case exists in Moltar, ArkType's chart legitimately reflects un-compiled Zod 4. *PR shape:* small, mechanical. *Open question:* whether to bump `zod` (currently `3.25.76`) and `zod4` (`zod@next`) to specific pinned versions in the same PR; recommend pin in a separate PR so the compiled-case PR is purely additive.

3. **`arktypeio/typescript-runtime-type-benchmarks`** — Verified to be a stale fork of Moltar (8 stars, identical `cases/zod.ts`, no zod4 case before the upstream merge). It is not the active source of arktype.io's chart — the homepage component (`ark/docs/components/RuntimeBenchmarksGraph.tsx`) just hard-codes `ArkType ⚡ 14 nanoseconds` / `Zod 👍 281 nanoseconds`, citing Moltar in the `(source)` link. Skip a fork-specific PR; upstreaming to Moltar covers it.

4. **`naruaway/valibot-benchmarks`** — `config.ts`. Currently `libs: ["valibot", "zod"], baseline: "zod", target: "valibot"`. PR to add a `valibot@compiled-zod` baseline variant or pin Zod to the post-`z.compile` version. The harness loads libraries from `./libs/<name>` or `node_modules`, so an extra `libs/zod@compiled/` directory installing `zod` and side-effect-importing `zod/compile` is the cleanest shape. *Why:* this is the harness Fabian links to from `valibot.dev`'s comparison guidance; cited indirectly in the Mar 23 blog post. *PR shape:* small, but parent repo (`naruaway`) is unofficial and may be unresponsive — `nimeshnayaju` maintains a fork, so the fallback is to PR the fork or carry our own. *Open question:* whether to coordinate with Fabian first since he's downstream of both forks.

5. **`DZakh/sury`** — `packages/sury/README.md`. The Comparison table cites `Zod@4.0.0-beta`, `Parse with the same schema 8,437 ops/ms` and `Create schema & parse once 6 ops/ms`. PR to bump the Zod column to the current 4.x release with both un-compiled and compiled numbers, ideally as two rows (`Zod 4 / Zod 4 + z.compile`) or one row with `8,437 ops/ms (compiled: X)`. *Why:* small, citable artifact — Sury actively positions itself as the fastest, and `Zod@4.0.0-beta` is more than a year stale. *PR shape:* small, README-only. *Open question:* whether DZakh will accept a comparison-table revision from us; he's friendly but particular about positioning — open as a draft and let him counter-propose the row shape.

### 6.2 — Competitor docs that cite Zod perf

6. **`arktypeio/arktype`** — `ark/docs/components/RuntimeBenchmarksGraph.tsx`. The homepage chart hard-codes `"ArkType ⚡ 14 nanoseconds"` / `"Zod 👍 281 nanoseconds"` with the caption `"20x faster than Zod4 and 2,000x faster than Yup at runtime"` (also in the prose body of `arktype.io` and likely a sibling `.mdx` page in `ark/docs/content/`). PR to update the Zod bar to reflect `z.compile`'d numbers, or add a third bar (`Zod (compiled)`), with a one-sentence footnote that "Zod 4 now ships an opt-in compiler (`z.compile` / `import 'zod/compile'`)" and updated Moltar source link. *Why:* highest-visibility citation of Zod perf in the ecosystem; the "20x" framing has been quoted on HN, Twitter, and in migration writeups. *PR shape:* nontrivial — needs discussion with David Blass first (he already said in issue #1303 he was planning a "comparisons section" with more nuance). Lead with the Moltar PR from §6.1.2 landing first so the chart has a real number to cite. *Open question:* whether David accepts a PR vs writing his own update; default to opening an issue with the proposed change attached.

7. **`fabian-hiller/valibot`** — `valibot.dev` site (blog/`why-migrate-to-valibot.mdx`, dated 2026-03-23). The post claims `"the same schema is initialized in 54 μs and therefore 16x faster than Zod v4"`, citing `schemabenchmarks.dev/initialization`. `z.compile` is a *runtime* optimization that lazy-compiles on first parse, so the initialization-only claim is unchanged — but the post follows immediately with `"Valibot might not (yet) win every benchmark. But if you care about the full package instead of a single number, Valibot offers one of the best overall tradeoffs, also for runtime performance"`, which the new runtime numbers do shift. PR shape is *not* "edit the post" but rather: get §6.1.1 (schemabenchmarks compiled variant) merged so the linked-from-this-post bench updates automatically. *Why:* Fabian co-maintains schemabenchmarks; a clean upstream there is more leverage than an editorial PR. *PR shape:* indirect — no direct PR to valibot.dev needed if §6.1.1 lands. *Open question:* whether to additionally suggest a one-line edit to the runtime-performance sentence after schemabenchmarks updates; default no, his framing is fair.

8. **`fabian-hiller/valibot`** — `website/src/routes/(layout)/guides/comparison.mdx` (`valibot.dev/guides/comparison/`). Performance section reads: `"Roughly speaking, the library is about twice as fast as Zod v3, and has similar runtime performance to Zod v4 (including Zod Mini), but is much slower than Typia and TypeBox, because we don't yet use a compiler that can generate highly optimized runtime code, and our implementation doesn't allow the use of the Function constructor."` The "similar runtime to Zod v4" half is now stale for compiled Zod. PR to clarify: "similar runtime performance to Zod v4 in default mode; Zod v4's opt-in compiler closes most of the gap to Typia/TypeBox on supported schemas." *Why:* this is the page Valibot users land on when comparing libraries; same authority as the blog post. *PR shape:* small, one-paragraph edit. *Open question:* none — Fabian generally accepts factual updates to this page.

9. **`DZakh/sury`** — `packages/sury/README.md` Comparison table (covered in §6.1.5; listing here for symmetry across categories).

10. **TypeBox, Effect Schema, Typia READMEs** — verified, no PR needed.
    - `sinclairzx81/typebox/readme.md`: perf tables compare against AJV8 only, not Zod. No Zod-relative claim.
    - `Effect-TS/effect/packages/effect/schema-vs-zod.md`: only a single Zod mention, on `discriminatedUnion` ergonomics. No perf claim.
    - `samchon/typia/README.md` + `typia.io/docs/pure/`: explicit Zod mention in `pure/` is qualitative ("schema is the source of truth — your TypeScript types are downstream"); perf claims target `class-validator` and `class-transformer`, not Zod. No PR target.

11. **Smaller validators (`runtypes`, `superstruct`, `io-ts`, `decoders`, `@sinclair/typemap`, `@railway-ts/pipelines`, `ata-validator`, `Valleys`)** — scanned, none carry a Zod-specific runtime-perf claim in their README or docs (most predate Zod 4 entirely and benchmark against each other or AJV). No PR targets.

### 6.3 — Internal Zod repo and docs site

12. **`colinhacks/zod`** — `packages/zod/README.md`. Add a short Performance section after Features (current README has none — Features lists "Tiny: `2kb` core bundle" but no runtime-perf note). One paragraph plus a 5-line code example: `import "zod/compile"` for global lazy compilation, or `z.compile(schema)` for explicit. Mention the design constraint (forward-direction sync only, async throws `ZodCompileAsyncError`). Link to `wiki/compile.md`. *Why:* the npm README is the highest-traffic Zod doc surface; cited by `npmjs.com/package/zod`. *PR shape:* small, maintainer self-merge.

13. **`colinhacks/zod`** — `packages/docs/content/api.mdx` (and likely a new `packages/docs/content/compile.mdx`). Add a top-level docs page documenting `z.compile` and `import "zod/compile"`, the unsupported-schema fallback, the async error, and the bundle-tradeoff for namespace imports (per §Phase 5 "Tree-shaking/API decision"). Cross-link from `packages/docs/content/v4/index.mdx` and add a changelog entry to `packages/docs/content/v4/changelog.mdx`. *Why:* the public docs are how almost every user discovers a new API; without a dedicated page `z.compile` will look like an undocumented namespace export. *PR shape:* nontrivial — needs full reference page covering signature, supported schemas, fallback semantics (including the post-Phase-5 runtime-island behavior — a single unsupported leaf no longer kills compilation of the surrounding object/tuple/array/record/intersection), perf numbers, and the global-mode subpath. Same PR as §6.12 or split, maintainer choice.

14. **`colinhacks/zod`** — `packages/docs/content/v4/changelog.mdx`. Single entry under the post-release version describing `z.compile` and `import "zod/compile"`, with a link to the new docs page. *Why:* changelog is the primary release-note channel. *PR shape:* trivial.

15. **`standard-schema/standard-schema`** — repo verification only, no PR needed unless a discrepancy surfaces. `z.compile(schema)` returns a *clone* with a replaced `_zod.run`; the `~standard` property is preserved through `util.clone`. Spot-check by reading `_zod['~standard']` off a compiled schema in a one-line test before launch and confirm `vendor: "zod"` and `validate` still work via the wrapper. If something is off, the fix lives in `core/compile.ts`, not the spec repo.

### 6.4 — Adjacent ecosystem libraries

16. **`t3-oss/t3-env`** — README docs page does not currently mention Zod runtime perf or startup cost; the value of `import "zod/compile"` is limited (env validation runs once at process start, compile fee is paid eagerly via the global shim, no net win on a single schema). *Skip unless a maintainer asks.*

17. **`trpc/trpc`** — `www/docs/server/validators.mdx` and adjacent perf-tip pages do not currently quote Zod parsing cost; per-request validation does benefit from `z.compile` but the win is marginal compared to network/serialization. *Skip unless we get explicit interest from the tRPC team.*

18. **`react-hook-form/resolvers`** — Zod resolver is a thin adapter; no perf claims in the docs. *Skip.*

19. **`@hookform/resolvers`, NestJS Zod adapters, hono validation, fastify-type-provider-zod** — same shape; thin adapters, no perf claims. *Skip.*

Bar for this section is intentionally high: only PR these if the doc surface currently carries a perf claim that `z.compile` would change. None do, as of verification on 2026-05-18.

### 6.5 — Social posts to acknowledge / respond to on launch

Not PRs, but worth a public reply (single tweet or comment) when `z.compile` ships, so the launch is discoverable from the threads where users were already discussing the perf gap.

- **HN, 2025-04: `news.ycombinator.com/item?id=43665540`** — "ArkType: Ergonomic TS validator 100x faster than Zod." Highest-impact thread on Zod runtime perf in the last cycle. Top comments discuss runtime size and the validation-vs-init tradeoff; a follow-up "Zod 4 now ships an opt-in compiler that closes most of this gap (link to compiled Moltar)" is on-topic. *Action:* one-line comment + repo link, post once §6.1.2 and the docs PR are live.
- **HN, 2025-06: `news.ycombinator.com/item?id=44031120`** — "Zod 4 looks good but even with their latest improvements, ArkType is still an order of magnitude faster." Same shape: one factual reply pointing at the compiled bench. Do not respond if §6.1.2 hasn't landed yet.
- **GitHub, 2025-02: `arktypeio/arktype#1303`** — "Address misleading performance benchmarks." David ssalbdivad replied that initialization tradeoffs would get a docs treatment "in an upcoming release." Worth a single follow-up linking the §6.2.6 PR once opened.
- **Valibot blog, 2026-03-23: `valibot.dev/blog/why-migrate-to-valibot/`** — "16x faster than Zod v4" (initialization). Quote-tweeted by Fabian. No reply needed *to the post* — the §6.1.1 schemabenchmarks PR is the substantive answer. If Fabian quote-tweets again post-launch, a single "compiled Zod numbers now upstreamed in schemabenchmarks" reply suffices.
- **Sury / DZakh — Dev.to articles linked from `DZakh/sury` README** — "Welcome Sury - The fastest schema with next-gen DX" and "ReScript Schema unique features" both cite Zod runtime perf inline. No reply needed unless DZakh declines the §6.1.5 README PR.

### 6.6 — Launch-day artifacts the Zod team ships

- **Changelog + release notes** — §6.14, on the version-bump commit.
- **README Performance section** — §6.12.
- **Docs page + reference** — §6.13.
- **Wiki canonical writeup** — `wiki/compile.md` (already maintained; verify it matches shipped behavior before tagging release).
- **Blog post or X thread by `@colinhacks`** — short writeup with one chart (compiled vs runtime vs arktype on the Moltar simple object) and a code sample showing both `z.compile(schema)` and `import "zod/compile"`. Lead with the design constraint (sync forward only, falls back transparently, runtime-island salvage for partially-unsupported schemas), not the perf number — the perf number is the closer.
- **Example repo or playground link** — optional. A `zod/compile-playground` repo with a Next.js or tRPC starter using `import "zod/compile"` is high-leverage if anyone screenshots a "before/after" comparison, but not blocking. *Defer unless requested.*
- **Two-column Moltar layout** — listed in §6.1.2; this is the chart we ship in the blog post.

### Open risks / coordination items

- **Bundle-size tradeoff disclosure.** Per Phase 5's Tree-shaking/API decision: `import * as z from "zod"` retains `core/compile.ts` because `z.compile` is on the namespace. The docs page (§6.13) needs to call this out explicitly so the Valibot "Zod ships its compiler whether you use it or not" rebuttal lands with us first, not them. One paragraph, factual.
- **Coordinating with Fabian Hiller.** Schemabenchmarks PR (§6.1.1) and Valibot comparison PR (§6.2.8) both touch his projects. Open the schemabenchmarks issue first and let it set the bench shape; the Valibot doc PR follows from that result.
- **Coordinating with David Blass.** ArkType homepage chart (§6.2.6) is the loudest single update we want made externally. Issue, not PR, until he opts in.
- **Async-throw discoverability.** The doc pages (§6.13) need a prominent `ZodCompileAsyncError` callout. Several adjacent ecosystem libs (`tRPC`, server-side resolvers) wrap user schemas they don't control — they'll hit this if they auto-enable `import "zod/compile"` for users with async refinements. A short "do not auto-enable for arbitrary user schemas" note in the docs prevents a class of bug reports.
