# AOT Compilation Feature

## Status
POC complete. `compile(schema)` returns type predicate, **8x faster than JIT**.

## Files
- `packages/zod/src/v4/core/compile.ts`
- `packages/zod/src/v4/core/tests/compile.test.ts`
- `packages/bench/compile.ts`

---

## Implementation Plan

### Phase 1: Low-Hanging Fruit (Simple Types) ✅

#### 1.1 Trivial Types
- [x] `void` - `=== undefined` (same as undefined)
- [x] `nan` - `Number.isNaN(x)`
- [x] `date` - `x instanceof Date && !Number.isNaN(x.getTime())`

#### 1.2 Enum
- [x] `enum` - `Set.has()` with hoisted constant Set

#### 1.3 Wrapper Types (passthrough to inner)
- [x] `readonly` - no-op wrapper, delegate to inner
- [x] `nonOptional` - unwrap inner, reject undefined
- [x] `default` - allow undefined, validate inner otherwise
- [x] `prefault` - same as default
- [x] `success` - no-op wrapper

#### 1.4 Nullish
- N/A - not a separate schema type, use union of null + undefined

### Phase 2: Checks ✅

#### 2.1 Numeric Checks
- [x] `less_than` (max) - `x < value` or `x <= value`
- [x] `greater_than` (min) - `x > value` or `x >= value`
- [x] `multiple_of` - `x % value === 0`
- [x] `number_format` (int, finite, safe) - specialized checks

#### 2.2 Length/Size Checks
- [x] `min_length` - `x.length >= min`
- [x] `max_length` - `x.length <= max`
- [x] `length_equals` - `x.length === len`
- [x] `min_size` - `x.size >= min`
- [x] `max_size` - `x.size <= max`
- [x] `size_equals` - `x.size === size`

#### 2.3 String Checks
- [x] `regex` - `pattern.test(x)` with hoisted RegExp
- [x] `lowercase` - `x === x.toLowerCase()`
- [x] `uppercase` - `x === x.toUpperCase()`
- [x] `includes` - `x.includes(str)` (native is fastest)
- [x] `starts_with` - `x.slice(0, N) === prefix` (10x faster than native)
- [x] `ends_with` - `x.slice(-N) === suffix` (10x faster than native)

#### 2.4 Custom Refinements
- [x] `.refine(fn)` - hoist predicate function as constant, call directly

### Phase 3: String Formats ✅

All formats use regex patterns from schema def. Hoist pattern as constant.

- [x] All formats with `def.pattern` (email, uuid, ipv4, etc.)
- [x] `url` - special: use `new URL()` try/catch

### Phase 4: Container Types ✅

#### 4.1 Tuple
- [x] Check `Array.isArray()`
- [x] Check length bounds (exact if no rest, min if rest)
- [x] Validate each fixed item by index
- [x] If rest: loop remaining elements

#### 4.2 Record
- [x] Object type check
- [x] Two paths:
  - Enumerated keys (enum/literal): use Set.has() for key validation
  - Dynamic keys: iterate all keys, validate each value

#### 4.3 Union
- [x] Try each option, return true on first success
- [x] Optimization: if all options are literals, use Set.has()
- [x] IIFE pattern for multi-option unions

#### 4.4 Intersection
- [x] Run both validators sequentially
- [x] Both must pass

#### 4.5 Map & Set
- [x] `x instanceof Map/Set`
- [x] Iterate entries/values and validate

### Phase 5: Advanced ✅

#### 5.1 Lazy
- [x] Use cached validator with runtime Zod fallback
- [x] Handles recursive schemas correctly (avoids infinite compile loops)

#### 5.2 Template Literal
- [x] Use pre-computed regex from `_zod.pattern`
- [x] Hoist as constant

#### 5.3 File
- [x] `x instanceof File` (with fallback for non-browser)

#### 5.4 Pipe
- [x] If no transform: validate input then output
- [x] If transform: validate input only (can't validate transformed value)

#### 5.5 Custom/Instanceof
- [x] `z.instanceof(Class)` uses custom with predicate function
- [x] Hoist predicate function as constant

---

## Completed

### `z.string()`, `z.number()`, `z.boolean()`, `z.bigint()`, `z.symbol()`
Simple `typeof` checks. No alternatives considered.

### `z.null()`, `z.undefined()`
Direct `=== null` / `=== undefined` checks.

### `z.any()`, `z.unknown()`
No-op (always valid).

### `z.never()`
Always `return false`.

### `z.literal()`
Direct `=== value` check, inlined.

### `z.object()`
Cache nested objects in local vars to avoid repeated property access:
```js
const v0 = input["nested"]; // cache once
v0["a"]; v0["b"]; v0["c"];  // reuse
```

### `z.strictObject()`

| Approach | Result | Notes |
|----------|--------|-------|
| `Set.has()` via closure | Slow | Set operations have overhead |
| Inlined POJO `k in {...}` | Slower | Object literal creation per call |
| POJO as closure constant | Still slow | `in` operator slower than `===` |
| Inlined `===` chain | Fast but O(n) | Order-dependent, scales with key count |
| `Object.keys().length > N` | Fastest | Only correct when ALL properties required |

**Winner:**
- All required props → `Object.keys().length > N`
- Has optional props → inlined `===` chain (correctness requires it)

### `z.array()`
`Array.isArray()` check, then loop with cached element var.

### `z.optional()`
Wrap inner check in `if (x !== undefined) { ... }`.

### `z.nullable()`
Wrap inner check in `if (x !== null) { ... }`.

### `z.looseObject()`
Same as `z.object()` - checks shape props, allows unknown keys. No extra validation.

### `z.object().catchall(schema)`
Uses `Set.has()` to identify unknown keys (Set hoisted to closure), then validates each unknown value against catchall schema:
```js
for (const k in input) {
  if (!knownKeys.has(k)) {
    const val = input[k];
    // validate val against catchall
  }
}
```

---

## TONOTDO

Based on `$ZodTypes` - these change output or require runtime logic:

- **`$ZodTransform`** - changes output type
- **`$ZodFunction`** - not data validation
- **`$ZodPromise`** - async (deprecated in v4)
- **`$ZodCatch`** - fallback behavior

Other exclusions:

- **`z.coerce.*`** - coercion is a transform
- **`z.preprocess()`** - transform
- **`z.codec()`** - bidirectional transform
- **`z.stringbool()`** - transform
- **`$ZodCheckProperty`** - arbitrary property access
- **`$ZodCheckOverwrite`** - mutates data
- **`.superRefine()`** - needs context object for issues
- **custom error messages** - AOT returns bool only
- **async refinements** - AOT is sync only

**Note:** `$ZodCustom` with predicate function IS supported (used by `z.instanceof`).

---

## Benchmarking Approach

For each new feature, create a focused benchmark in `packages/bench/` that:
1. Tests the specific feature in isolation
2. Compares AOT vs JIT vs non-JIT
3. Tests edge cases (empty arrays, max-size objects, etc.)

Template:
```typescript
import * as z4 from "zod/v4";
import * as z4core from "zod/v4/core";
import { metabench } from "./metabench.js";

const schema = z4./* feature */;
const aot = z4core.compile(schema);

const DATA = /* test data */;

// Verify correctness first
console.log("AOT:", aot(DATA[0]));
console.log("Zod:", schema.safeParse(DATA[0]).success);

const bench = metabench("feature name", {
  "AOT"() { for (const d of DATA) aot(d); },
  "JIT"() { for (const d of DATA) schema.safeParse(d); },
  "non-JIT"() { for (const d of DATA) schema.safeParse(d, { jitless: true }); },
});

await bench.run();
```

---

## Investigation: String Methods

### `endsWith` (compile-endswith.ts)

| Approach | Performance | Notes |
|----------|-------------|-------|
| `String.slice(-N) === suffix` | **Fastest** | Winner |
| `String.substring()` | 1x slice | Same perf |
| `String.endsWith()` | 9.7x slower | Native method |
| Regex `.*suffix$` | 210x slower | Avoid |

### `startsWith` (compile-startswith.ts)

| Approach | Performance | Notes |
|----------|-------------|-------|
| `String.indexOf() === 0` | **Fastest** | Winner (marginally) |
| `String.slice(0, N) === prefix` | 1x indexOf | Same perf |
| `String.startsWith()` | 9.7x slower | Native method |
| Regex `^prefix.*` | 22x slower | Avoid |

### `includes` (compile-includes.ts)

| Approach | Performance | Notes |
|----------|-------------|-------|
| `String.includes()` | **Fastest** | Native optimized |
| `String.indexOf() !== -1` | 1.04x slower | Negligible diff |
| Regex | 25x slower | Avoid |

**Decision:** Use `slice()` for startsWith/endsWith, keep native `includes()`.

---

## Investigation: Custom Refinements

Custom refinements (`.refine()`) store a function in `def.fn`. We can support them by:
1. Hoisting the function as a constant
2. Calling it directly in generated code

```typescript
// z.string().refine(x => x.length > 3)
// Generated code:
if (typeof input !== "string") return false;
if (!c0(input)) return false;  // c0 = def.fn
return true;
```

**Trade-offs:**
- PRO: Supports user-defined validation
- CON: Function call overhead (not inlined)
- CON: `.superRefine()` not supported (needs context object)

**Decision:** Support `.refine()` since it's simple. Reject `.superRefine()`.

---

## Log

### 2024-XX-XX: Initial POC
- Implemented primitives, object, array, literal, optional, nullable
- 8x faster than JIT on strictObject benchmark

### 2024-XX-XX: Checks Implementation
- Added numeric checks (min/max/int/multipleOf)
- Added string checks (min/max length, regex, startsWith/endsWith/includes)
- Added array length checks
- Benchmarked string methods, found slice() is 10x faster than native methods

### 2024-XX-XX: Container Types Implementation
- Added tuple, union, intersection, record, map, set
- Union optimization: all-literals case uses Set.has()
- Record optimization: enum keys use Set.has() for validation

### 2024-XX-XX: Advanced Types Implementation
- Added template literal (uses pre-computed regex)
- Added lazy with cached runtime fallback (handles recursion)
- Added pipe (validates input, optionally output if no transform)
- Added custom/instanceof (hoist predicate as constant)
- Added file (instanceof with non-browser fallback)
