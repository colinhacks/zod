# Type Inference in Object Schemas

## Understanding Zod Type Inference

Zod uses TypeScript's type inference system to automatically derive TypeScript types from Zod schemas. However, there are some edge cases where TypeScript's inference behaves unexpectedly.

## Common Issue: Object Property Types

### The Problem

When using union types (`.or()`) in object schemas, you might notice unexpected `undefined` in the inferred types:

```typescript
import { z } from "zod";

// Standalone schema - works correctly ✅
const EventNameSchema = z.string().or(z.array(z.string()));
type EventName = z.infer<typeof EventNameSchema>;
// Result: string | string[]

// Object property - unexpected undefined ❌
const EventSchema = z.object({
  name: z.string().or(z.array(z.string()))
});

type EventWithName = z.infer<typeof EventSchema>;
type EventName2 = EventWithName["name"];
// Result: (string | string[]) & (string | string[] | undefined)
```

### Why This Happens

This is **not a Zod bug** but a TypeScript type inference limitation:

1. TypeScript's mapped types add implicit `| undefined` for certain patterns
2. The interaction between union types and object property inference
3. Structural typing system behavior

## Solutions

### Solution 1: Type Assertion (Quick Fix)

```typescript
type EventName = EventWithName["name"] as string | string[];
```

### Solution 2: Utility Type

```typescript
type NonUndefined<T> = T extends undefined ? never : T;
type EventName = NonUndefined<EventWithName["name"]>;
```

### Solution 3: Reuse Standalone Schema (Recommended)

```typescript
const EventNameSchema = z.string().or(z.array(z.string()));

const EventSchema = z.object({
  name: EventNameSchema // Reuse the schema
});

type Event = z.infer<typeof EventSchema>;
type EventName = Event["name"]; // ✅ string | string[]
```

### Solution 4: Use Helper Type

```typescript
type ExtractProperty<T, K extends keyof T> = 
  T[K] extends undefined ? never : T[K];

type EventName = ExtractProperty<EventWithName, "name">;
```

## Best Practices

1. **Reuse schemas**: Define complex types once and reuse them
2. **Use utility types**: Create helper types for common patterns
3. **Document edge cases**: Add comments explaining type workarounds
4. **Test types**: Use type tests to ensure correct inference

## Related Issues

- [TypeScript Issue #2654](https://github.com/colinhacks/zod/issues/2654)
- [TypeScript Handbook - Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)

## Examples

See [`examples/type-inference-workarounds.ts`](../examples/type-inference-workarounds.ts) for complete code examples.
