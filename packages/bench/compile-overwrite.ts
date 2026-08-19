import { metabench } from "./metabench.js";

// Test different approaches for handling value transformations in AOT

const testData = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? "  HELLO WORLD  " : "  TEST STRING  "));

// Approach 1: Use let and reassign
function withLetReassign(input: unknown): boolean {
  if (typeof input !== "string") return false;
  let v0 = input;
  v0 = v0.trim();
  v0 = v0.toLowerCase();
  if (v0.length < 3) return false;
  return true;
}

// Approach 2: Create new const for each transform
function withConstChain(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const v0 = input;
  const v1 = v0.trim();
  const v2 = v1.toLowerCase();
  if (v2.length < 3) return false;
  return true;
}

// Approach 3: Inline transforms (no intermediate vars)
function withInline(input: unknown): boolean {
  if (typeof input !== "string") return false;
  if (input.trim().toLowerCase().length < 3) return false;
  return true;
}

// Verify correctness
console.log("=== Correctness Check ===");
console.log("Let:", withLetReassign("  HELLO  "), withLetReassign("  AB  "));
console.log("Const:", withConstChain("  HELLO  "), withConstChain("  AB  "));
console.log("Inline:", withInline("  HELLO  "), withInline("  AB  "));
console.log("");

const bench = metabench("overwrite handling", {
  "let with reassign"() {
    for (const s of testData) withLetReassign(s);
  },
  "const chain"() {
    for (const s of testData) withConstChain(s);
  },
  "inline (no vars)"() {
    for (const s of testData) withInline(s);
  },
});

await bench.run();
