import { metabench } from "./metabench.js";

// Test different approaches for endsWith check

const SUFFIX = "world";

// Test data - mix of matching and non-matching strings
const DATA = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? `hello beautiful world` : `hello there`));

// Approach 1: String.prototype.endsWith
const endsWithNative = (s: string) => s.endsWith(SUFFIX);

// Approach 2: Regex pattern
const pattern = new RegExp(`.*${SUFFIX}$`);
const endsWithRegex = (s: string) => {
  pattern.lastIndex = 0;
  return pattern.test(s);
};

// Approach 3: Slice comparison
const endsWithSlice = (s: string) => s.slice(-SUFFIX.length) === SUFFIX;

// Approach 4: Substring comparison
const endsWithSubstring = (s: string) => s.substring(s.length - SUFFIX.length) === SUFFIX;

// Verify correctness
console.log("=== Correctness Check ===");
console.log("Native:", endsWithNative("hello world"), endsWithNative("hello"));
console.log("Regex:", endsWithRegex("hello world"), endsWithRegex("hello"));
console.log("Slice:", endsWithSlice("hello world"), endsWithSlice("hello"));
console.log("Substring:", endsWithSubstring("hello world"), endsWithSubstring("hello"));
console.log("");

const bench = metabench("endsWith implementations", {
  "String.endsWith()"() {
    for (const s of DATA) endsWithNative(s);
  },
  "Regex pattern"() {
    for (const s of DATA) endsWithRegex(s);
  },
  "String.slice()"() {
    for (const s of DATA) endsWithSlice(s);
  },
  "String.substring()"() {
    for (const s of DATA) endsWithSubstring(s);
  },
});

await bench.run();
