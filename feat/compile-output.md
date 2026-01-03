# AOT Compilation: Returning Transformed Data

## Goal
Extend `compile()` to optionally return transformed data instead of just a boolean.

**Key constraint**: NO runtime overhead for schemas without transforms.

---

## Schema Categories

### 1. No Transforms (Zero Overhead)
- Primitives: `string`, `number`, `boolean`, `bigint`, `symbol`
- Simple containers: `array`, `tuple`, `map`, `set` (with non-transforming elements)
- Loose objects (passthrough unknown keys)
- Validation-only checks: `min`, `max`, `regex`, `refine`, etc.

**Behavior**: Return input unchanged. No cloning, no modification.

### 2. Overwrite Checks
- `trim()`, `toLowerCase()`, `toUpperCase()`, `normalize()`

**Behavior**: Transform value in place or track new value.

### 3. Transform Schemas
- `z.string().transform(s => s.length)`
- Returns completely different type

**Behavior**: Must call transform function, return result.

### 4. Pipe/Codec
- `z.string().pipe(z.coerce.number())`
- Input type differs from output type

**Behavior**: Validate input, run through pipeline, return output.

### 5. Strip Objects (default mode)
- `z.object({ name: z.string() })` - no catchall
- Unknown keys should NOT appear in output

**Behavior**: Need to build new object with only known keys, OR delete unknown keys from input.

### 6. Strict Objects
- `z.strictObject({...})` or `.strict()`
- Unknown keys cause validation failure

**Behavior**: No special output handling (failure = no output).

---

## Implementation Options

### Option A: Mutate Input In-Place
```typescript
// For overwrite on object property
input["name"] = input["name"].trim();
return input;

// For strip objects
for (const k in input) {
  if (!knownKeys.has(k)) delete input[k];
}
return input;
```

**Pros**: Fastest possible, no allocation
**Cons**: Mutates user data (surprising?), can't handle primitives with transforms

### Option B: Clone When Needed
```typescript
// Detect at compile time if schema transforms
const needsClone = hasTransforms(schema);

// Generated code
if (needsClone) {
  const output = {};
  output["name"] = input["name"].trim();
  return output;
} else {
  return input;
}
```

**Pros**: Doesn't mutate input, cleaner semantics
**Cons**: Allocation overhead for transforming schemas

### Option C: Hybrid - Mutate Objects, New Values for Primitives
```typescript
// Primitives with transforms - must return new value
const v0 = input.trim();
return v0;

// Objects - mutate in place
input["name"] = input["name"].trim();
return input;
```

**Pros**: Fast for objects, correct for primitives
**Cons**: Inconsistent mutation semantics

---

## Decision Points to Benchmark

### 1. Strip Object: Delete vs Build New
```typescript
// Option A: Delete unknown keys
for (const k in input) {
  if (!knownKeys.has(k)) delete input[k];
}
return input;

// Option B: Build new object
const output = {};
output["name"] = input["name"];
output["age"] = input["age"];
return output;

// Option C: Object.fromEntries
return Object.fromEntries(
  Object.entries(input).filter(([k]) => knownKeys.has(k))
);
```

### 2. Object Property Transforms
```typescript
// Option A: Mutate
input["name"] = c0(input["name"]); // trim
return input;

// Option B: Build new
const output = { ...input };
output["name"] = c0(input["name"]);
return output;

// Option C: Inline build
return {
  name: c0(input["name"]),
  age: input["age"],
};
```

### 3. Nested Object Transforms
```typescript
// Deep object with transform at leaf
z.object({
  user: z.object({
    name: z.string().trim()
  })
})

// Option A: Mutate nested
input["user"]["name"] = c0(input["user"]["name"]);
return input;

// Option B: Clone path to transform
return {
  ...input,
  user: {
    ...input["user"],
    name: c0(input["user"]["name"])
  }
};
```

---

## Schema Analysis Phase

At compile time, analyze schema to determine:

```typescript
interface SchemaAnalysis {
  hasTransforms: boolean;      // Any overwrites, transforms, pipes
  hasStripKeys: boolean;       // Object without catchall (strip mode)
  transformPaths: string[][];  // Paths to transforming properties
  isPassthrough: boolean;      // Loose object, no transforms
}

function analyzeSchema(schema: SomeType): SchemaAnalysis {
  // Recursively analyze
  // - Check for overwrite checks
  // - Check for transform/pipe schemas
  // - Check object catchall mode
  // - Track paths to transforms
}
```

---

## Proposed API

### Option 1: New function
```typescript
// Current - validation only
const validate = compile(schema);
validate(data); // => boolean

// New - with output
const parse = compileWithOutput(schema);
parse(data); // => T | undefined
```

### Option 2: Mode parameter
```typescript
const validate = compile(schema, { output: false }); // => boolean
const parse = compile(schema, { output: true }); // => T | undefined
```

### Option 3: Different return based on schema
```typescript
// If schema has no transforms, return input
// If schema has transforms, return transformed data
// Return undefined on validation failure
const parse = compile(schema);
parse(data); // => T | undefined
```

---

## Benchmark Plan

### 1. Non-transforming object (baseline)
```typescript
const schema = z.object({ name: z.string(), age: z.number() });
// Compare: return true vs return input
```

### 2. Strip object overhead
```typescript
const schema = z.object({ name: z.string() });
const data = { name: "test", extra1: 1, extra2: 2, extra3: 3 };
// Compare: delete keys vs build new vs current (ignore)
```

### 3. Single property transform
```typescript
const schema = z.object({ name: z.string().trim() });
// Compare: mutate vs clone vs build new
```

### 4. Nested transform
```typescript
const schema = z.object({
  user: z.object({ name: z.string().trim() })
});
// Compare: mutate nested vs clone path
```

### 5. Multiple transforms
```typescript
const schema = z.object({
  a: z.string().trim(),
  b: z.string().toLowerCase(),
  c: z.string().toUpperCase(),
});
// Compare approaches with multiple transforms
```

---

## Questions to Answer

1. **Mutation acceptable?** Zod mutates by default - is this expected for AOT too?
2. **Strip objects**: How common are unknown keys? Is delete perf critical?
3. **Allocation budget**: How much slower is cloning vs mutation?
4. **API design**: Separate function vs mode parameter vs auto-detect?
