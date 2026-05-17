import { metabench } from "./metabench.js";

// =============================================================================
// Benchmark 1: Non-transforming object - return input vs return true
// =============================================================================

const DATA_SIMPLE = Array.from({ length: 1000 }, () => ({
  name: "hello",
  age: 42,
  active: true,
}));

function validateOnly(input: unknown): boolean {
  if (typeof input !== "object" || input === null) return false;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string") return false;
  if (typeof obj.age !== "number") return false;
  if (typeof obj.active !== "boolean") return false;
  return true;
}

function validateAndReturn(input: unknown): object | undefined {
  if (typeof input !== "object" || input === null) return undefined;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string") return undefined;
  if (typeof obj.age !== "number") return undefined;
  if (typeof obj.active !== "boolean") return undefined;
  return obj;
}

console.log("=== Benchmark 1: Non-transforming (return bool vs return input) ===");
console.log("Validate only:", validateOnly(DATA_SIMPLE[0]));
console.log("Validate+return:", validateAndReturn(DATA_SIMPLE[0]));
console.log("");

const bench1 = metabench("non-transforming object", {
  "return boolean"() {
    for (const d of DATA_SIMPLE) validateOnly(d);
  },
  "return input"() {
    for (const d of DATA_SIMPLE) validateAndReturn(d);
  },
});

await bench1.run();

// =============================================================================
// Benchmark 2: Strip object - delete keys vs build new
// =============================================================================

const DATA_EXTRA_KEYS = Array.from({ length: 1000 }, () => ({
  name: "hello",
  age: 42,
  extra1: "remove me",
  extra2: 123,
  extra3: true,
  extra4: null,
}));

const KNOWN_KEYS = new Set(["name", "age"]);

function stripDelete(input: Record<string, unknown>): Record<string, unknown> {
  for (const k in input) {
    if (!KNOWN_KEYS.has(k)) delete input[k];
  }
  return input;
}

function stripBuildNew(input: Record<string, unknown>): Record<string, unknown> {
  return {
    name: input.name,
    age: input.age,
  };
}

function stripFromEntries(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([k]) => KNOWN_KEYS.has(k)));
}

// Need fresh copies for delete test
const freshCopies = () => DATA_EXTRA_KEYS.map((d) => ({ ...d }));

console.log("=== Benchmark 2: Strip object (delete vs build new) ===");
const testCopy = { ...DATA_EXTRA_KEYS[0] };
console.log("Original keys:", Object.keys(testCopy));
console.log("After delete:", Object.keys(stripDelete({ ...testCopy })));
console.log("Build new:", Object.keys(stripBuildNew(testCopy)));
console.log("fromEntries:", Object.keys(stripFromEntries(testCopy)));
console.log("");

const bench2 = metabench("strip object (4 unknown keys)", {
  "delete keys (mutate)"() {
    const copies = freshCopies();
    for (const d of copies) stripDelete(d);
  },
  "build new object"() {
    for (const d of DATA_EXTRA_KEYS) stripBuildNew(d);
  },
  "Object.fromEntries"() {
    for (const d of DATA_EXTRA_KEYS) stripFromEntries(d);
  },
});

await bench2.run();

// =============================================================================
// Benchmark 3: Single property transform (trim)
// =============================================================================

const DATA_NEEDS_TRIM = Array.from({ length: 1000 }, () => ({
  name: "  hello  ",
  age: 42,
}));

const trim = (s: string) => s.trim();

function transformMutate(input: Record<string, unknown>): Record<string, unknown> {
  input.name = trim(input.name as string);
  return input;
}

function transformClone(input: Record<string, unknown>): Record<string, unknown> {
  const output = { ...input };
  output.name = trim(input.name as string);
  return output;
}

function transformBuildNew(input: Record<string, unknown>): Record<string, unknown> {
  return {
    name: trim(input.name as string),
    age: input.age,
  };
}

// Need fresh copies for mutate test
const freshTrimCopies = () => DATA_NEEDS_TRIM.map((d) => ({ ...d }));

console.log("=== Benchmark 3: Single property transform ===");
const trimTest = { ...DATA_NEEDS_TRIM[0] };
console.log("Original:", trimTest);
console.log("After mutate:", transformMutate({ ...trimTest }));
console.log("Clone:", transformClone(trimTest));
console.log("Build new:", transformBuildNew(trimTest));
console.log("");

const bench3 = metabench("single property transform (trim)", {
  "mutate in place"() {
    const copies = freshTrimCopies();
    for (const d of copies) transformMutate(d);
  },
  "clone with spread"() {
    for (const d of DATA_NEEDS_TRIM) transformClone(d);
  },
  "build new object"() {
    for (const d of DATA_NEEDS_TRIM) transformBuildNew(d);
  },
});

await bench3.run();

// =============================================================================
// Benchmark 4: Nested object transform
// =============================================================================

const DATA_NESTED = Array.from({ length: 1000 }, () => ({
  user: {
    name: "  hello  ",
    email: "test@example.com",
  },
  meta: {
    created: 12345,
  },
}));

type NestedData = { user: { name: string; email: string }; meta: { created: number } };

function nestedMutate(input: NestedData): NestedData {
  input.user.name = trim(input.user.name);
  return input;
}

function nestedClonePath(input: NestedData): NestedData {
  return {
    ...input,
    user: {
      ...input.user,
      name: trim(input.user.name),
    },
  };
}

function nestedDeepClone(input: NestedData): NestedData {
  const output = JSON.parse(JSON.stringify(input));
  output.user.name = trim(output.user.name);
  return output;
}

const freshNestedCopies = () =>
  DATA_NESTED.map((d) => ({
    user: { ...d.user },
    meta: { ...d.meta },
  }));

console.log("=== Benchmark 4: Nested object transform ===");
const nestedTest = { user: { ...DATA_NESTED[0].user }, meta: { ...DATA_NESTED[0].meta } };
console.log("Original:", nestedTest);
console.log("Mutate:", nestedMutate({ user: { ...nestedTest.user }, meta: { ...nestedTest.meta } }));
console.log("Clone path:", nestedClonePath(nestedTest));
console.log("");

const bench4 = metabench("nested object transform", {
  "mutate nested"() {
    const copies = freshNestedCopies();
    for (const d of copies) nestedMutate(d);
  },
  "clone path to transform"() {
    for (const d of DATA_NESTED) nestedClonePath(d);
  },
  "JSON deep clone"() {
    for (const d of DATA_NESTED) nestedDeepClone(d);
  },
});

await bench4.run();

// =============================================================================
// Benchmark 5: Multiple transforms
// =============================================================================

const DATA_MULTI = Array.from({ length: 1000 }, () => ({
  firstName: "  JOHN  ",
  lastName: "  DOE  ",
  email: "  TEST@EXAMPLE.COM  ",
  unchanged: 42,
}));

const toLowerCase = (s: string) => s.toLowerCase();

function multiMutate(input: Record<string, unknown>): Record<string, unknown> {
  input.firstName = trim(input.firstName as string);
  input.lastName = trim(input.lastName as string);
  input.email = toLowerCase(trim(input.email as string));
  return input;
}

function multiBuildNew(input: Record<string, unknown>): Record<string, unknown> {
  return {
    firstName: trim(input.firstName as string),
    lastName: trim(input.lastName as string),
    email: toLowerCase(trim(input.email as string)),
    unchanged: input.unchanged,
  };
}

const freshMultiCopies = () => DATA_MULTI.map((d) => ({ ...d }));

console.log("=== Benchmark 5: Multiple transforms ===");
const multiTest = { ...DATA_MULTI[0] };
console.log("Original:", multiTest);
console.log("Mutate:", multiMutate({ ...multiTest }));
console.log("Build new:", multiBuildNew(multiTest));
console.log("");

const bench5 = metabench("multiple transforms (3 props)", {
  "mutate in place"() {
    const copies = freshMultiCopies();
    for (const d of copies) multiMutate(d);
  },
  "build new object"() {
    for (const d of DATA_MULTI) multiBuildNew(d);
  },
});

await bench5.run();
