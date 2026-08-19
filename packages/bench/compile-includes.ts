import { metabench } from "./metabench.js";

// Test different approaches for includes check

const NEEDLE = "beautiful";

// Test data - mix of matching and non-matching strings
const DATA = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? `hello beautiful world` : `hello world`));

// Approach 1: String.prototype.includes
const includesNative = (s: string) => s.includes(NEEDLE);

// Approach 2: Regex pattern
const pattern = new RegExp(NEEDLE);
const includesRegex = (s: string) => {
  pattern.lastIndex = 0;
  return pattern.test(s);
};

// Approach 3: indexOf check
const includesIndexOf = (s: string) => s.indexOf(NEEDLE) !== -1;

// Verify correctness
console.log("=== Correctness Check ===");
console.log("Native:", includesNative("hello beautiful world"), includesNative("hello world"));
console.log("Regex:", includesRegex("hello beautiful world"), includesRegex("hello world"));
console.log("IndexOf:", includesIndexOf("hello beautiful world"), includesIndexOf("hello world"));
console.log("");

const bench = metabench("includes implementations", {
  "String.includes()"() {
    for (const s of DATA) includesNative(s);
  },
  "Regex pattern"() {
    for (const s of DATA) includesRegex(s);
  },
  "String.indexOf()"() {
    for (const s of DATA) includesIndexOf(s);
  },
});

await bench.run();
