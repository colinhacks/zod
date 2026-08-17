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
- String formats are classified by an **allowlist** of formats whose `def.pattern` is the complete check, not by whether a pattern exists. Several formats advertise a shape-only pattern and validate the rest separately — `credit_card` (Luhn digit), `base64`, `base64url`, `jwt`, `ipv6`, `cidrv6`, `url` — and those hoist the runtime validator instead. A custom format compiles `def.fn`, the predicate the runtime itself calls, rather than trusting the pattern it was built from. A format that appears in neither list loses its fast path rather than compiling to a regex that accepts more than the runtime does.

## Scope cuts

- **Forward direction only.** Codec encode / `ctx.direction === "backward"` paths skip the fast path and go straight to the runtime. The wrapper checks `ctx.direction` and bails on backward. Add backward codegen later if benches motivate it.
- **No async.** The compiler eagerly throws if it encounters an async refinement, transform, or check during the codegen walk. There is no affordance for promises anywhere in generated code. `safeParseAsync` skips the fast path.
- **jitless.** Global mode respects `config().jitless`: the shim restores the runtime parser instead of compiling, so `import "zod/compile"` is inert in CSP/no-eval environments. Calling `z.compile(schema)` explicitly remains an explicit opt-in to `new Function`; under CSP it throws `ZodCompileUnsupportedError` rather than a raw `EvalError`.
- **No recursive schemas.** A schema whose subtree contains a cycle throws `ZodCompileUnsupportedError` and parses through the runtime. Input containing a reference cycle terminates because the memoizer registers each in-progress output before its children run, keyed on the parse context every schema in that call shares; a generated fast path takes an input and returns a value, so it has no context to key on and would follow the cycle until the stack ran out. A compiled node also hands back to the runtime when the value it receives is a memoizer back edge, so a transform sitting on a cycle still raises `$ZodCyclicError` from its own parse. Supporting this properly means threading the parse context and `memo.alloc` into generated containers.

## Benchmarks

`pnpm dev packages/bench/compile-matrix.ts` sweeps 55 schemas across every category and prints runtime, compiled and raw-fast-path throughput with the speedup. Three things about the method matter for reading the numbers:

- **How many schemas share the process.** This is the single largest lever on the result, larger than anything the compiler does. With many schemas live, the `safeParse` site and zod's own internal dispatch sites go megamorphic, which taxes an interpreter walking a tree of nodes far more than it taxes one flat generated function. The same 55 schemas report a median **2.4x** measured together and **1.6x** measured one per process. The default is together, because an application holds many schemas at once and that is the number its users see; `--isolate` gives the single-schema figure, which is what to tune against.
- **Inputs arrive through an array load.** Passed as a constant, the whole call is loop-invariant and V8 hoists it out of the timing loop — and it hoists plain interpreter code far more readily than an opaque `new Function` closure, which flattered the runtime by up to 1.9x. The values do not need to differ; an array read is enough.
- **Results have to escape.** A discarded result lets V8 delete the parse outright (`z.string()` measured 625M ops/sec, ~1.6ns); an un-escaped one gets stack-allocated. Both are defeated before timing.
- **Interleaved, best of 15 rounds.** Absolute ops/sec on a laptop drifts by tens of percent between runs, so every speedup is a ratio of two measurements taken microseconds apart.
- **Correctness first.** Compiled output is checked against the runtime before anything is timed, and each row reports whether the schema compiled, fell back, or fell through — a number can't come from a fast path that silently didn't run.

53 of 55 schemas compile. Median **2.4x**, range 0.66x–13.9x.

| | |
| --- | --- |
| Biggest wins | `z.array(z.string())` x100 **13.9x**, `z.array(z.object())` x50 **9.3x**, 20-key object **8.9x**, object union **8.4x**, `.pipe()` **7.7x**, `z.number().int().min().max()` **5.8x** |
| Typical | nested object 4.5x, tuple 4.8x, intersection 4.3x, discriminated union 4.3x, `.refine()` 4.6x, string with checks 2.8x, strict object 3.0x, flat 5-key object 2.5x |
| Marginal | string formats 1.4–2.4x, `z.record` dynamic keys 1.3–1.7x, most bare primitives 1.2–1.7x, `.catch()` 1.2x |
| Slower compiled | bare `z.string()` **0.70x** — the only case that is reliably negative here |
| Forced fallbacks | recursive schema 1.00x, `z.xor` 0.94x — the wrapper's bypass checks cost nothing measurable |

The win tracks how much work a schema does per parse, because what compilation removes is per-node dispatch and payload allocation, not the checks themselves. A 20-key object or an array of objects amortises that across a lot of work; a bare primitive has none to amortise.

How much that matters depends heavily on the regime. Measured one schema per process, seven schemas come out slower compiled — every bare primitive plus `.default()` on an absent input, at 0.63–0.91x — because the interpreter's path for a single `typeof` is small enough for V8 to inline flat, while generated code lives in a `new Function` closure it will not inline into the caller, so the call itself exceeds the check. Measured with many schemas live, that inlining advantage largely evaporates and only bare `z.string()` stays negative. Compiling a leaf is therefore not worth special-casing on these numbers: outside a microbenchmark the loss is confined to one schema shape, and leaves nested inside a container are inlined into the parent's generated function and never pay the call at all.

The last row is the one to design around. **A bare primitive is slower compiled**, and the cause is not `safeParse`: `.parse()`, which allocates no result object, is *worse* (`z.string()` 0.42x, `z.literal()` 0.45x), while both APIs agree on composites (5-key object 1.73x vs 1.72x, nested 3.59x vs 3.76x). What costs is the call itself. Generated code lives in a `new Function` closure that V8 will not inline into the caller, so every parse pays a real call, and below roughly ten nanoseconds of actual work that call exceeds the `typeof` it replaced. One check is enough to flip it — `z.string().min(1)` is 2.8–3.2x.

Two consequences. Global mode makes trivial leaf schemas measurably slower while making everything composed of them faster, so it is not a free win and is worth measuring against a real schema set. And the exact primitive figures are the least trustworthy in the table: at ~8ns/op the answer moves between 0.6x and 1.0x depending on harness details, so read them as "no benefit here", not as a precise ratio. Everything at or above 2x reproduces across every measurement regime tried.

### Against arktype

Same method, arktype 2.1.19, all cases sharing one process:

| case | arktype | zod runtime | `z.compile()` | vs arktype |
| --- | --- | --- | --- | --- |
| discriminated union | 25.3M | 12.5M | **37.2M** | **1.47x** |
| `z.array(z.number())` x100 | 5.1M | 1.1M | **5.5M** | **1.07x** |
| nested object (moltar) | 20.1M | 6.1M | **20.3M** | **1.01x** |
| `z.array(z.object())` x50 | 3.8M | 411k | 3.5M | 0.93x |
| simple 2-key object | 131.6M | 26.4M | 45.2M | 0.34x |

Two things are worth knowing before quoting any of this.

**Arktype returns its input; zod allocates fresh output.** Verified on every case. Two handwritten validators over the moltar object, identical checks, differing only in what they return, measure 112.2M returning the input against 61.1M building a new one — so **the output allocation alone costs 1.84x**, and zod cannot give it up while `parse` means transforms, defaults and key stripping. Compare like with like accordingly.

**Arktype degrades much harder than compiled zod when many schemas are live.** On the moltar case arktype measures 85.3M alone and 20.1M sharing a process with four other schemas; compiled zod measures 24.5M and 20.3M. Whatever arktype shares internally between validators goes megamorphic in a way a standalone generated function does not. That is why the isolated numbers show a 3.5x gap and the shared numbers show parity, and it is why the shared regime is the one to quote for application performance.

Any earlier claim in this wiki that a case was "8x faster" or near parity with arktype was measured before these effects were understood and should not be trusted; `packages/bench/compile-vs-arktype.ts` additionally adds ~18ns of fixed per-call overhead, which compresses every ratio toward 1.

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
