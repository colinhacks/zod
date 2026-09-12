import { metabench } from "./metabench.js";

// Test different approaches for startsWith check

const PREFIX = "hello";

// Test data - mix of matching and non-matching strings
const DATA = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? `hello beautiful world` : `goodbye world`));

// Approach 1: String.prototype.startsWith
const startsWithNative = (s: string) => s.startsWith(PREFIX);

// Approach 2: Regex pattern
const pattern = new RegExp(`^${PREFIX}.*`);
const startsWithRegex = (s: string) => {
  pattern.lastIndex = 0;
  return pattern.test(s);
};

// Approach 3: Slice comparison
const startsWithSlice = (s: string) => s.slice(0, PREFIX.length) === PREFIX;

// Approach 4: Substring comparison
const startsWithSubstring = (s: string) => s.substring(0, PREFIX.length) === PREFIX;

// Approach 5: Index check
const startsWithIndex = (s: string) => s.indexOf(PREFIX) === 0;

// Verify correctness
console.log("=== Correctness Check ===");
console.log("Native:", startsWithNative("hello world"), startsWithNative("goodbye"));
console.log("Regex:", startsWithRegex("hello world"), startsWithRegex("goodbye"));
console.log("Slice:", startsWithSlice("hello world"), startsWithSlice("goodbye"));
console.log("Substring:", startsWithSubstring("hello world"), startsWithSubstring("goodbye"));
console.log("IndexOf:", startsWithIndex("hello world"), startsWithIndex("goodbye"));
console.log("");

const bench = metabench("startsWith implementations", {
  "String.startsWith()"() {
    for (const s of DATA) startsWithNative(s);
  },
  "Regex pattern"() {
    for (const s of DATA) startsWithRegex(s);
  },
  "String.slice()"() {
    for (const s of DATA) startsWithSlice(s);
  },
  "String.substring()"() {
    for (const s of DATA) startsWithSubstring(s);
  },
  "String.indexOf()"() {
    for (const s of DATA) startsWithIndex(s);
  },
});

await bench.run();
