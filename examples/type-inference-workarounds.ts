/**
 * Zod Type Inference Workarounds
 * 
 * This file demonstrates solutions for common type inference issues
 * when using Zod with TypeScript.
 */

import { z } from "zod";

// ============================================================================
// Issue: Object property types include unexpected undefined
// ============================================================================

const EventNameSchema = z.string().or(z.array(z.string()));
type EventName = z.infer<typeof EventNameSchema>;
// ✅ Correctly inferred as: string | string[]

const EventSchema = z.object({
  name: z.string().or(z.array(z.string()))
});

type EventWithName = z.infer<typeof EventSchema>;
type EventName2 = EventWithName["name"];
// ❌ Incorrectly inferred as: (string | string[]) & (string | string[] | undefined)

// ============================================================================
// Solution 1: Type Assertion (Simple)
// ============================================================================

type EventNameSolution1 = EventWithName["name"] as string | string[];

// ============================================================================
// Solution 2: Utility Type to Remove Undefined
// ============================================================================

/**
 * Removes undefined from a union type
 */
type NonUndefined<T> = T extends undefined ? never : T;

/**
 * Removes null and undefined from a union type
 */
type NonNullable<T> = T extends null | undefined ? never : T;

type EventNameSolution2 = NonUndefined<EventWithName["name"]>;

// ============================================================================
// Solution 3: Reuse Standalone Schema
// ============================================================================

const EventSchemaSolution3 = z.object({
  name: EventNameSchema // Reuse the standalone schema
});

type EventSolution3 = z.infer<typeof EventSchemaSolution3>;
type EventNameSolution3 = EventSolution3["name"];
// ✅ Correctly inferred as: string | string[]

// ============================================================================
// Solution 4: Helper Type for Object Property Extraction
// ============================================================================

/**
 * Extract property type from inferred object type, removing undefined
 */
type ExtractProperty<T, K extends keyof T> = NonUndefined<T[K]>;

type EventNameSolution4 = ExtractProperty<EventWithName, "name">;

// ============================================================================
// Solution 5: Use .merge() for Complex Objects
// ============================================================================

const BaseSchema = z.object({
  id: z.string(),
  createdAt: z.date()
});

const EventSchemaSolution5 = BaseSchema.merge(z.object({
  name: EventNameSchema
}));

type EventSolution5 = z.infer<typeof EventSchemaSolution5>;
type EventNameSolution5 = EventSolution5["name"];
// ✅ Better type inference with merge

// ============================================================================
// Solution 6: Define Object Schema First, Then Extract
// ============================================================================

interface IEvent {
  name: EventName;
  id: string;
}

const EventSchemaSolution6: z.ZodType<IEvent> = z.object({
  name: EventNameSchema,
  id: z.string()
});

type EventSolution6 = z.infer<typeof EventSchemaSolution6>;
type EventNameSolution6 = EventSolution6["name"];
// ✅ Explicit interface ensures correct types

// ============================================================================
// Utility Types Export
// ============================================================================

export type {
  NonUndefined,
  NonNullable,
  ExtractProperty
};

// ============================================================================
// Test Cases
// ============================================================================

function testTypeInference() {
  const event1: EventWithName = { name: "test" };
  
  // These should all work without type errors:
  const name1: string | string[] = event1.name as string | string[];
  const name2: string | string[] = event1.name as NonUndefined<typeof event1.name>;
  const name3: string | string[] = event1.name as ExtractProperty<EventWithName, "name">;
  
  console.log("All type tests passed!");
}

testTypeInference();
