import * as z4 from "zod/v4";
import * as z4core from "zod/v4/core";
import { metabench } from "./metabench.js";

// Tuple without rest
const tupleNoRest = z4.tuple([z4.string(), z4.number(), z4.boolean()]);
const aotNoRest = z4core.compile(tupleNoRest);

// Tuple with rest
const tupleWithRest = z4.tuple([z4.string(), z4.number()]).rest(z4.boolean());
const aotWithRest = z4core.compile(tupleWithRest);

// Test data
const validNoRest = Array.from({ length: 1000 }, () => ["hello", 42, true]);
const invalidNoRest = Array.from({ length: 1000 }, () => ["hello", "not a number", true]);

const validWithRest = Array.from({ length: 1000 }, () => ["hello", 42, true, false, true, false]);
const invalidWithRest = Array.from({ length: 1000 }, () => ["hello", 42, true, false, "not bool", false]);

// Verify correctness
console.log("=== Correctness Check ===");
console.log("No Rest - valid:", aotNoRest(validNoRest[0]), "Zod:", tupleNoRest.safeParse(validNoRest[0]).success);
console.log("No Rest - invalid:", aotNoRest(invalidNoRest[0]), "Zod:", tupleNoRest.safeParse(invalidNoRest[0]).success);
console.log(
  "With Rest - valid:",
  aotWithRest(validWithRest[0]),
  "Zod:",
  tupleWithRest.safeParse(validWithRest[0]).success
);
console.log(
  "With Rest - invalid:",
  aotWithRest(invalidWithRest[0]),
  "Zod:",
  tupleWithRest.safeParse(invalidWithRest[0]).success
);
console.log("");

console.log("=== Generated Code (No Rest) ===");
console.log(aotNoRest.code);
console.log("");

console.log("=== Generated Code (With Rest) ===");
console.log(aotWithRest.code);
console.log("");

const bench = metabench("tuple benchmarks", {
  "no rest (valid) - AOT"() {
    for (const d of validNoRest) aotNoRest(d);
  },
  "no rest (valid) - JIT"() {
    for (const d of validNoRest) tupleNoRest.safeParse(d);
  },
  "no rest (valid) - non-JIT"() {
    for (const d of validNoRest) tupleNoRest.safeParse(d, { jitless: true });
  },
  "with rest (valid) - AOT"() {
    for (const d of validWithRest) aotWithRest(d);
  },
  "with rest (valid) - JIT"() {
    for (const d of validWithRest) tupleWithRest.safeParse(d);
  },
  "with rest (valid) - non-JIT"() {
    for (const d of validWithRest) tupleWithRest.safeParse(d, { jitless: true });
  },
});

await bench.run();
