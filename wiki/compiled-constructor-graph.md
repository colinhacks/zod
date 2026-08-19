# Compiled constructor graph

This is an internal proposal for reducing the runtime cost of the Zod Core, Mini, and Classic constructor graph without changing observable behavior.

## Status

Exploratory. This should not block the trait work in [#6318](https://github.com/colinhacks/zod/pull/6318). The proposed experiment is small enough to evaluate independently and discard if it does not produce a clear bundle-size and construction-time win.

## Summary

Zod's runtime type graph is not a class hierarchy. It is a directed acyclic graph: a string format is both a schema and a check, Mini and Classic add their own identities, and codecs combine multiple identities. Traits currently model that graph correctly, but every instance reconstructs part of it by recursively calling initializers, checking trait membership, adding trait names, and applying prototypes.

The alternative is to compile the built-in constructor graph once, when each constructor is defined. Each built-in constructor would have a static descriptor containing an ordered program of local initialization blocks and parent calls. The compiler would turn that program into a flat operation tape that preserves the current entry, parent-call, prototype, and unwind order. Normal construction would execute the tape directly. The existing dynamic `$constructor` path would remain available for third-party and runtime composition.

The first version should retain a real, mutable `Set<string>` at `_zod.traits` and continue to implement `instanceof` through that set. This deliberately gives up the largest possible memory win in exchange for preserving trait order, set identity, per-instance mutation, cross-copy `instanceof`, custom constructor composition, and downstream code that reads `_zod.traits`.

This design can remove repeated graph traversal and membership checks from built-in construction. It may also let bundlers discard more of the generic composition machinery for named imports. It does not promise a win: bundle size and end-to-end construction must be measured before expanding the experiment.

## Goals

- Preserve all current runtime behavior, including `instanceof` across Core, Mini, Classic, and multiple installed copies.
- Preserve `_zod.traits` as an own, mutable `Set<string>` with the current insertion order.
- Preserve custom `$constructor` composition, prototype augmentation, extracted methods, cloning, and error construction.
- Reduce the bundle size of minimal named Mini and Classic imports.
- Improve built-in schema construction without slowing parsing.

## Non-goals

- Replacing the public class-shaped API with plain objects or functions.
- Removing traits as the compatibility representation.
- Changing parser kernels or schema definitions.
- Making `_zod.traits` lazy in the first implementation.
- Rewriting every constructor before the spike proves a measurable win.

## Why native classes are not enough

A native class has one prototype parent. Zod constructors can have several semantic parents.

For example, a Core string format participates in both the schema and check graphs. Classic and Mini then add their own public identities on top of the Core identity. A codec similarly combines pipe, transform, and codec identities. Flattening these relationships into a single native inheritance chain would either lose valid `instanceof` results or require secondary identity machinery, which recreates traits under another name.

The compatibility graph also extends beyond prototypes:

- A constructor may initialize state contributed by more than one parent.
- Initializers are idempotent because custom constructors may compose them dynamically.
- Downstream packages inspect `_zod.traits` directly.
- Users can augment constructor prototypes after import.
- Methods can be extracted from an instance and called without their original receiver.

The relevant optimization target is therefore graph execution, not the graph model itself.

## Compatibility contract

The spike should treat the following behavior as fixed:

| Surface | Required behavior |
| --- | --- |
| `instanceof` | Every currently valid Core, Mini, and Classic relationship remains valid, including relationships across duplicate package copies. |
| `_zod.traits` | Remains an own, mutable `Set<string>` with the same names and insertion order. |
| Trait mutation | Adding or deleting a name continues to affect trait-based `instanceof` exactly as it does today. |
| Custom constructors | Third-party `$constructor` values can compose built-in and custom initializers dynamically. |
| Prototype augmentation | Methods added to a constructor prototype remain visible on existing and new instances. |
| Extracted methods | `const optional = schema.optional; optional()` continues to work. |
| Construction | `constructor`, `name`, cloning, deferred initialization, and error parents retain their current behavior. |
| Parsing | Parse results, issues, async behavior, and hot-path performance remain unchanged. |

This rules out proxies, virtual trait sets, shared mutable sets, and descriptor-only `instanceof` as first implementations.

## Proposed design

### Static descriptors for built-ins

Each built-in constructor would declare a descriptor similar to this:

```ts
type $ConstructorProgramStep =
  | { kind: "init"; run: $Initializer }
  | { kind: "parent"; descriptor: $ConstructorDescriptor };

interface $ConstructorDescriptor {
  name: string;
  constr: $constructor;
  program: readonly $ConstructorProgramStep[];
  compiledOperations: readonly $ConstructorOperation[];
  traits: readonly string[];
}
```

The descriptor compiler would run once, when the constructor is defined. It would:

1. Emit the constructor's trait insertion when entering its program.
2. Inline parent programs at the exact position of each parent call.
3. Preserve local work that occurs before, between, or after parent calls.
4. Emit prototype installation when unwinding from each constructor program.
5. Deduplicate repeated constructor programs by identity, matching the current trait guard.
6. Detect cycles during development.
7. Store the resulting flat operation tape on the constructor.

This ordering matters. Some constructors mutate their definition before invoking a parent, while string-format initialization intentionally invokes the check parent before the string parent. Pre-populating every trait or applying a generic topological sort would be observable inside initializers and would not meet the compatibility goal.

The graph should be declared explicitly for the spike. Code generation would add another moving part before the runtime design is proven.

### Fast built-in construction

Normal construction of a built-in schema would use its compiled descriptor:

```ts
function constructBuiltin(instance: object, def: unknown, descriptor: $ConstructorDescriptor) {
  installZodInternals(instance, {
    def,
    constr: descriptor.constr,
    traits: new Set(),
  });

  for (const operation of descriptor.compiledOperations) {
    operation.run(instance, def);
  }

  runDeferredInitializers(instance);
}
```

The operation tape includes trait additions, local initializer blocks, and prototype installation in their current order. Parent traversal and deduplication have already been compiled, so the normal path avoids repeated `Set.has`, recursion, and prototype discovery. It intentionally retains each ordered `Set.add` because an initializer can observe the trait set while construction is in progress.

### Compatible dynamic initialization

Public `.init(instance, def)` behavior should remain idempotent and dynamic. It can interpret the same descriptor program with the current trait guards when it is called directly by a custom constructor. The compiled path and dynamic path would therefore share one declarative source of ordering rather than maintaining two unrelated initializer bodies.

This creates two paths:

- Built-in `new` calls use the compiled plan.
- Custom and runtime composition use the existing guarded initializer semantics.

The generic `$constructor` export should remain available. Built-in constructors can use a smaller internal factory so named imports do not necessarily retain the generic composition path.

### Keep trait-based `instanceof`

The first implementation should continue to resolve `instanceof` through `_zod.traits.has(name)`. Switching to descriptor ancestry would make `instanceof` faster, but it would change the result after a user mutates the trait set. Keeping the current check isolates the experiment to construction and bundling.

If no ecosystem dependency on trait mutation is found after this ships, descriptor ancestry could be evaluated separately as an explicitly breaking or compatibility-relaxing change.

## Expected effects

### Construction performance

The likely win is removing repeated graph work from every built-in instance:

- Recursive parent initialization becomes a flat loop.
- Trait membership checks are removed from the known built-in path while ordered trait additions remain intact.
- Prototype contributors are discovered once rather than per instance.
- Deduplication moves from runtime to constructor definition time.

The improvement must be measured on complete constructors. A microbenchmark of `new Set()` or a direct function call is useful for attribution but is not an acceptance result.

### Bundle size

The bundle-size hypothesis is that built-in constructors can retain a small compiled executor while the generic graph builder remains tree-shakeable. This must be tested for both Mini and Classic; moving metadata from code into descriptors can increase a bundle if the descriptors duplicate information or prevent dead-code elimination.

### Memory

The initial design should not claim a per-instance memory win. It still allocates the same trait set. A shared or lazy trait representation could save hundreds of bytes on trait-heavy instances, but it would put the zero-regression requirement at risk.

### Parse performance

Parsing should be structurally unaffected. Any repeatable change outside the benchmark control band should be treated as a regression until explained.

## Why not make traits lazy

A lazy `_zod.traits` accessor looks attractive because most instances never expose their trait set. It is not suitable for the first experiment:

- `_zod.traits` is observable as an own property.
- Downstream packages read it directly and expect Set methods.
- Per-instance mutation must remain isolated.
- Accessors and late property installation can change object shapes and dictionary behavior.
- Materialization adds another branch to `instanceof` unless ancestry is checked elsewhere.

Lazy materialization can be measured later, after the compiled graph proves useful on its own.

## Alternatives considered

| Approach | Reason not to pursue |
| --- | --- |
| Native classes only | Cannot represent the current multiple-identity graph without secondary ancestry machinery. |
| Plain functional objects | Breaks public constructors, prototypes, augmentation, and `instanceof`. |
| Wrapper objects | Changes object identity and makes cloning, errors, and method extraction more complex. |
| Proxies | Adds runtime overhead and reflection differences while making performance less predictable. |
| Numeric trait bitmask | Breaks extensibility, cross-copy identity, readable trait names, and arbitrary custom traits. |
| Shared trait `Set` | Breaks per-instance mutation and Set identity. |
| Descriptor-only `instanceof` | Breaks mutation-driven `instanceof` and custom runtime composition unless a fallback recreates the current checks. |
| Lazy trait `Set` | May reduce memory, but risks reflection and object-shape regressions before the constructor optimization is proven. |

## Spike scope

The experiment should stop after three representative slices:

1. Core `$ZodType`, `$ZodString`, `$ZodStringFormat`, and `$ZodEmail`.
2. The corresponding Mini type, string, string-format, and email constructors.
3. Mini pipe and codec constructors, which exercise multiple semantic parents.

This is enough to test a simple chain, the schema/check diamond, flavor-specific identities, and a more complex graph. Classic should be included in bundle and compatibility measurements even if the first implementation slice is Mini-heavy.

## Validation plan

### Behavior

Add a compact constructor matrix covering:

- Every expected Core, Mini, and Classic `instanceof` relationship in the spike.
- ESM and CJS imports.
- Two installed copies of Zod.
- Trait Set identity, insertion order, and per-instance mutation.
- Direct `.init()` calls and custom `$constructor` composition.
- Prototype augmentation before and after instance creation.
- Extracted methods.
- Clone, constructor, name, deferred initialization, and error-parent behavior.

The existing prototype and codec tests should remain unchanged and pass:

```sh
pnpm vitest run \
  packages/zod/src/v4/classic/tests/prototypes.test.ts \
  packages/zod/src/v4/mini/tests/prototypes.test.ts \
  packages/zod/src/v4/classic/tests/codec.test.ts \
  packages/zod/src/v4/mini/tests/codec.test.ts \
  packages/zod/src/v4/classic/tests/instance-footprint.test.ts
```

Before landing an implementation, run the full repository gates:

```sh
pnpm build
pnpm vitest run
```

### Bundle size

Compare the spike against the same merge base with identical esbuild settings. Measure at least:

- A minimal named `string` import from `zod/mini`.
- A minimal named `string` import from `zod`.
- A string-format import.
- A codec import.

Record raw, minified, gzip, and Brotli sizes. Inspect the generated bundles as well as the totals so a win is attributable to removed constructor machinery rather than an incidental symbol rename.

### Performance

Measure:

- Construction of type, string, email, pipe, and codec schemas.
- A mixed realistic schema factory.
- Synchronous parse success and failure.
- Asynchronous parse success and failure.
- Heap use for large batches of live instances.

Use interleaved baseline and candidate runs in the same process configuration. Report confidence intervals or repeated-run spread rather than a single best result.

## Acceptance criteria

Proceed beyond the spike only if all of the following are true:

- The complete compatibility matrix and existing tests pass without changing their assertions.
- Minimal named imports become smaller in both Mini and Classic after gzip and Brotli.
- Representative constructor benchmarks improve beyond run-to-run noise.
- Parse benchmarks remain within the control band.
- The implementation is simpler than maintaining two fully separate constructor systems.

Stop if preserving a real trait Set eliminates the bundle-size win, if the fast and dynamic paths begin to diverge semantically, or if the design requires accessors, proxies, or build-time code generation to show an improvement.

## Current evidence

The measurements that motivated this proposal are exploratory and machine-specific:

- In an isolated Node 26.5.0 microbenchmark, assigning a shared ancestry reference was substantially cheaper than constructing a five-entry Set, confirming that trait initialization has a measurable lower-level cost.
- A five-name per-instance Set used roughly 232 bytes more than a shared reference; a ten-name Set used roughly 392 bytes more. The initial proposal intentionally does not capture this memory saving.
- Current trait-based `instanceof` was competitive with or faster than native checks against deeper base classes. This is another reason not to combine the constructor experiment with a new `instanceof` mechanism.
- Comparing [#6318](https://github.com/colinhacks/zod/pull/6318) with its merge base using minimal named `string` imports increased gzip output by about 166 bytes for Mini and 142 bytes for Classic in the local harness. A compiled built-in executor is worth considering only if it reverses those totals rather than moving costs between files.

These numbers establish where to investigate, not acceptance thresholds. The spike needs repository-level benchmarks and bundle inspection.

## Relationship to method binding

The constructor graph and method binding are separate optimizations. [#5870](https://github.com/colinhacks/zod/pull/5870) demonstrated that moving behavior to prototypes could break extracted methods; [#5897](https://github.com/colinhacks/zod/pull/5897) recovered that contract with lazy binding instead of eagerly creating every closure. A compiled constructor graph should assume the current method-binding contract and avoid reopening it.

The practical sequence is:

1. Continue evaluating [#6318](https://github.com/colinhacks/zod/pull/6318) on its own compatibility and performance merits.
2. Implement the bounded compiled-graph spike on top of a stable baseline.
3. Keep the change only if it produces an additive, independently measurable win.

## Recommendation

Do not replace traits with native classes, plain objects, proxies, or bitmasks. Keep traits as the compatibility representation and experiment with compiling the built-in constructor graph so instances no longer rediscover that graph at runtime.

The safest first implementation is deliberately conservative: explicit descriptors, a flat built-in construction plan, the existing dynamic `$constructor` fallback, and an ordinary per-instance trait Set. If that version cannot make both Mini and Classic smaller while making construction faster, stop. More aggressive trait representations would no longer meet the zero-regression premise.
