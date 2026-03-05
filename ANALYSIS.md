# Zod Issue #2654 Analysis - Object Property Type Inference

## Problem Description

When using `z.object()` with a union type field (`.or()`), the inferred type includes an unexpected intersection with `undefined`.

### Reproduction

```typescript
import { z } from "zod";

const EventNameSchema = z.string().or(z.array(z.string()));

type EventName = z.infer<typeof EventNameSchema>;
// EventName is string | string[] ✅

const EventSchema = z.object({
  name: z.string().or(z.array(z.string()))
});

type EventWithName = z.infer<typeof EventSchema>;
type EventName2 = EventWithName["name"];
// EventName2 is (string | string[]) & (string | string[] | undefined) ❌
```

## Root Cause Analysis

This is **not a Zod bug** but a TypeScript type inference limitation:

1. **Standalone schema**: When inferring from a standalone union schema, TypeScript correctly infers `string | string[]`

2. **Object property**: When the same union is used as an object property, TypeScript's type inference adds an implicit `| undefined` due to:
   - Optional property handling in mapped types
   - TypeScript's structural typing system
   - The way Zod's `infer` utility type works with object schemas

## Solution Options

### Option 1: Use Type Assertion (Recommended for Users)

```typescript
type EventName2 = EventWithName["name"] as string | string[];
```

### Option 2: Use Utility Type to Remove Undefined

```typescript
type NonUndefined<T> = T extends undefined ? never : T;
type EventName2 = NonUndefined<EventWithName["name"]>;
```

### Option 3: Define Schema Differently

```typescript
const EventSchema = z.object({
  name: EventNameSchema // Reuse the standalone schema
});
```

## Documentation Fix

Since this is a TypeScript limitation (not a Zod bug), the best fix is to:

1. Add documentation explaining this behavior
2. Provide workarounds in the Zod docs
3. Add a FAQ entry for this common question

## Implementation

I will create:
1. Documentation page explaining the behavior
2. Example code showing workarounds
3. TypeScript utility types for common cases

## Files to Create

- `docs/object-inference.md` - Documentation
- `examples/type-inference-workarounds.ts` - Example code

## ETA

- Analysis: ✅ Complete
- Documentation: 1-2 hours
- Examples: 30 minutes
- Total: ~2 hours
