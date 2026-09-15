import { metabench } from "./metabench.js";

// =============================================================================
// Compare array construction strategies
// =============================================================================

// Small arrays (3 elements)
const DATA_SMALL = Array.from({ length: 1000 }, () => ["hello", "world", "test"]);

// Medium arrays (10 elements)
const DATA_MEDIUM = Array.from({ length: 1000 }, () => ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);

// Large arrays (25 elements)
const DATA_LARGE = Array.from({ length: 1000 }, () => Array.from({ length: 25 }, (_, i) => `item${i}`));

// =============================================================================
// Pure construction (no validation)
// =============================================================================

function arrayReturnInput<T>(input: T[]): T[] {
  return input;
}

function arrayBuildIndex<T>(input: T[]): T[] {
  const out: T[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i]!;
  }
  return out;
}

function arraySlice<T>(input: T[]): T[] {
  return input.slice();
}

console.log("=== Pure Array Construction ===\n");

const benchPureSmall = metabench("pure construction (3 elements)", {
  "return input"() {
    for (const d of DATA_SMALL) arrayReturnInput(d);
  },
  "index assignment"() {
    for (const d of DATA_SMALL) arrayBuildIndex(d);
  },
  slice() {
    for (const d of DATA_SMALL) arraySlice(d);
  },
});

await benchPureSmall.run();

const benchPureLarge = metabench("pure construction (25 elements)", {
  "return input"() {
    for (const d of DATA_LARGE) arrayReturnInput(d);
  },
  "index assignment"() {
    for (const d of DATA_LARGE) arrayBuildIndex(d);
  },
  slice() {
    for (const d of DATA_LARGE) arraySlice(d);
  },
});

await benchPureLarge.run();

// =============================================================================
// With validation included
// =============================================================================

function validateReturnInput(input: unknown[]): unknown[] | undefined {
  if (!Array.isArray(input)) return undefined;
  for (let i = 0; i < input.length; i++) {
    if (typeof input[i] !== "string") return undefined;
  }
  return input;
}

function validateBuildIndex(input: unknown[]): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out: string[] = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const elem = input[i];
    if (typeof elem !== "string") return undefined;
    out[i] = elem;
  }
  return out;
}

console.log("\n=== With Validation ===\n");

const benchValSmall = metabench("validate + construct (3 elements)", {
  "validate + return"() {
    for (const d of DATA_SMALL) validateReturnInput(d);
  },
  "validate + build"() {
    for (const d of DATA_SMALL) validateBuildIndex(d);
  },
});

await benchValSmall.run();

const benchValMedium = metabench("validate + construct (10 elements)", {
  "validate + return"() {
    for (const d of DATA_MEDIUM) validateReturnInput(d);
  },
  "validate + build"() {
    for (const d of DATA_MEDIUM) validateBuildIndex(d);
  },
});

await benchValMedium.run();

const benchValLarge = metabench("validate + construct (25 elements)", {
  "validate + return"() {
    for (const d of DATA_LARGE) validateReturnInput(d);
  },
  "validate + build"() {
    for (const d of DATA_LARGE) validateBuildIndex(d);
  },
});

await benchValLarge.run();
