# z.compile

AOT compiler for v4 schemas. Lives on the `z.compile` branch.

## Surface

Two entry points, intentionally non-overlapping:

- `z.compile(schema)` — returns a cloned schema whose `_zod.run` runs an AOT-compiled fast path, falling back to the original `_zod.run` on failure. Eager compile at call time. Original schema untouched. Clone is a normal `ZodType` — `.parse`, `.safeParse`, `.refine`, `.extend`, intersection, pipe, etc. all work as usual. Note that derivations (`.refine`, `.extend`, `.optional`, `.meta`, …) construct *new* schemas that do not inherit the fast path — compile the final schema, not an intermediate.
- `import "zod/compile"` — installs a global post-processor that wraps every newly-constructed schema with a one-shot lazy compile shim. Backed by a subpath export whose backing module is marked `sideEffects: true` in `package.json`.

There is no `z.compile()` no-arg form. Different shapes for different jobs: explicit per-schema compile vs. project-wide opt-in.

### Tree-shaking note

`z.compile` is exported from the main `zod` namespace. Measured against the built dist (esbuild and Rollup, minified): both bundlers fully drop `core/compile.ts` (~25-28 KB minified) from a namespace import when `z.compile` is unused — the earlier concern that namespace imports retain the compiler did not survive measurement. The cost only materializes when the namespace object escapes static analysis (re-exporting the whole namespace, dynamic property access). The side-effect module `zod/compile` is retained only when imported, via the `sideEffects` allowlist in `package.json`. Decision: `z.compile` stays on the main namespace.

## Failure model

The compiled fast path is a happy-path validator. It returns the parsed/transformed output or an `INVALID` sentinel. On `INVALID`, the wrapper calls the original `_zod.run` to produce the canonical `ZodError`.

Consequences:

- 100% error parity with uncompiled Zod by construction. The fast path never produces errors; the runtime is the only source of `ZodError`s. We don't maintain a second error-path implementation, which is the main reason this design is preferable to arktype's dual `Allows` + `Apply` codegen.
- User-supplied `.refine` / `.transform` / `.superRefine` callbacks run **at most twice** on invalid input — once in the fast path, once in the runtime fallback. This matches Zod's existing Standard Schema sync-then-async behavior. The bound is enforced, including under global mode where every nested schema carries its own compiled wrapper: when a wrapper falls back it flags the parse ctx, and downstream compiled wrappers skip their fast paths for the rest of that parse.
- Success-path *value* parity is the compiler's responsibility, verified via differential tests against the runtime (key order, `undefined`-valued vs absent keys, array holes, frozenness, and NaN/-0 included — plus a per-fixture assertion that the fast path actually produced the value rather than silently falling back). It is not free; it has to be earned per schema type and per check.
- Anything the fast path can't model *exactly* throws `ZodCompileUnsupportedError` at codegen time — there are no silently-dead always-fallback fast paths and no plain `Error` escapes, and a `new Function` failure (malformed codegen, CSP rejection) is converted to the same type. Containers island unsupported children; unions don't (a falsely-rejecting branch would corrupt match semantics), and `z.xor` always falls back for the same reason. Custom `when`-gated checks, NaN/Invalid-Date comparison bounds, and `__proto__` shape/record keys also force fallback.

## Scope cuts

- **Forward direction only.** Codec encode / `ctx.direction === "backward"` paths skip the fast path and go straight to the runtime. The wrapper checks `ctx.direction` and bails on backward. Add backward codegen later if benches motivate it.
- **No async.** The compiler eagerly throws if it encounters an async refinement, transform, or check during the codegen walk. There is no affordance for promises anywhere in generated code. `safeParseAsync` skips the fast path.
- **jitless.** Global mode respects `config().jitless`: the shim restores the runtime parser instead of compiling, so `import "zod/compile"` is inert in CSP/no-eval environments. Calling `z.compile(schema)` explicitly remains an explicit opt-in to `new Function`; under CSP it throws `ZodCompileUnsupportedError` rather than a raw `EvalError`.

## Output construction

Generated code always builds new objects and arrays; it never mutates input or `payload.value`. Justified by `packages/bench/compile-passthrough.ts` and `packages/bench/compile-output.ts`: build-new wins or ties mutate-in-place across every benchmarked shape, and produces predictable semantics (callers can mutate the returned value freely).

The wrapper only writes to `payload.value` after the fast path returns a non-INVALID result. No partial-mutation corruption window.

## Global mode mechanics

`import "zod/compile"` sets `globalConfig.postProcessor` to the compile function. The schema constructor in `core.ts` (the `_` function) invokes the post-processor once per construction, after `init()` walks the inheritance chain and `_zod.deferred` flushes.

The post-processor does **not** compile eagerly. It installs a one-shot `_zod.run` shim that compiles on first parse and overwrites itself. This avoids paying compile cost for the N-1 throwaway intermediate schemas in any builder chain (`z.string().min(3).max(10).regex(...)` is four constructor calls; only the last is ever used). Mirrors the existing object JIT (`generateFastpass`) pattern.

Reentrancy: the post-processor short-circuits when a module-local `compiling` flag is set, so internal schema construction during a compile pass (e.g. via `util.clone`) doesn't recurse.

## Code sharing with the runtime

Where the compiler emits a check whose logic also lives in `util.*` or the runtime parser, hoist the runtime function via `addConstant(ctx, fn)` and emit a call. One source of truth; future fixes propagate automatically; eliminates the silent-drift class of bug that fix(v4) commits keep producing.

Already done: `util.floatSafeRemainder` for `multipleOf`, `util.shallowClone` for default's cloning, `parseValidURL`, `isValidBase64`, `isValidBase64URL`, `isValidJWT`, hoisted regex patterns for string formats, and hoisted user `.refine` / `.transform` / `.overwrite` functions.

Inline only when the operation is 1–3 bytecodes of language-native ops (`typeof`, `===`, `Array.isArray`, `instanceof`, basic comparisons, property access). Wrapping `typeof x === "string"` in a util call would be strictly worse.

For the Apply-mode work (if it ever happens), every issue-emission site should call a hoisted issue-builder from the runtime — `util.finalizeIssue`, `util.prefixIssues`, the canonical payload shapes for `invalid_type` / `too_small` / `too_big` etc. Issue construction is in cold branches; call overhead doesn't matter; parity matters a lot.

## Composability

The clone returned by `z.compile(schema)` is a normal Zod schema. It can be embedded anywhere — `z.object({ field: compiled })`, intersected, piped, etc. Inside an uncompiled parent the fast path is still invoked but loses much of its win: the parent re-pays the per-field payload allocation, path tracking, and `_zod.run` dispatch overhead. To get whole-graph performance, compile the outermost schema or enable global mode.

Children of the cloned schema are shared by reference with the original. `z.compile(schema)` is a snapshot operation. Mutating the original (`s.refine(...)` returns a new schema, etc.) does not affect the clone and vice versa.

## Non-goals

- **Two compiled codegens per node (arktype-style `Allows` + `Apply`).** Considered. The runtime-fallback model gets us error parity without the maintenance cost of a parallel error-path codegen. Revisit only if benchmarks show the fallback's failure-path cost matters to a real workload.
- **Returning a function instead of a schema.** Considered. Returning a schema preserves chaining and composition, integrates with Standard Schema via the existing `safeParse → _zod.run` path, and lets the fast path be exposed transparently with no parallel API surface.
- **In-place mutation of the input schema.** Considered. Cloning avoids the mutation-surprise footgun for library code that takes user schemas as inputs.
- **Public `globalConfig.postProcessor`.** Internal implementation detail. Not documented as part of the public config surface. If multiple consumers ever need to register hooks, this becomes a registry, not a single slot.

## Runtime islands

Object, tuple, array, record (value side), intersection, and catch codegen route children through `compileChild`. A child that throws `ZodCompileUnsupportedError` is rolled back and replaced with a hoisted runtime call (`runtimeRun(schema, value)`), so one unsupported leaf doesn't abort compilation of the surrounding structure. Unions and discriminated unions deliberately do **not** island: first-match/exactly-one semantics require per-branch failures to mean "the runtime would reject", not "couldn't compile".

## Open

- **Array output policy.** Arktype often wins array benchmarks because it can return the input for validation-only arrays. Zod semantics return parsed output (fresh arrays/objects). Any move toward input reuse would be a deliberate semantic/performance tradeoff, not an incidental optimization.
- **Registry identity.** The compiled clone inherits registry metadata through `_zod.parent` like any derived schema, which by registry design excludes `id`. `z.toJSONSchema(z.compile(s))` therefore loses a registered `id`; pass the original to `toJSONSchema` if `$defs` identity matters.
