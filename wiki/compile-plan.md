# z.compile implementation + test plan

Plan to land everything in `wiki/compile.md`. Phases are ordered by dependency; each phase ends in a green test suite. Items within a phase are roughly commit-sized.

## Current status

Track per-phase. Update as work lands. If context compresses, the next agent reads this section first.

- **Phase 1** — complete. `compile()` now returns a cloned schema with replaced `_zod.run`. Fast path delegates to the *original* schema's `_zod.run` on bypass (backward/async/skipChecks) and on `INVALID` fallback — this preserves `inst` references so error messages match. `compileFastpass()` exposed internally for direct fast-path use (Phase 2 will use it). Eager async detection throws `ZodCompileAsyncError` for `.refine`/`.transform`/overwrite/pipe-transform/custom-fn. Tests migrated to schema API. Full repo suite: 4055/4055 passing.
- **Phase 2** — not started.
- **Phase 2b** — not started. Dual-suite verification via vitest projects (was a separate proposal in `.cursor/plans/`, will integrate into this doc when reached).
- **Phase 3** — not started.
- **Phase 4** — not started. Note: Phase 4 fixes already partially landed on this branch (`__proto__` skip, multipleOf float tolerance, tuple optStart, Map/Set cloning in `.default()`, multi-value `z.literal`). Remaining: record key transforms, record symbol keys, base64 double-check, discriminated union optimization.
- **Phase 5** — not started.

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
