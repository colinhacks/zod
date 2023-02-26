import { z } from "./src";

// benchmark
// run 10000 times
console.time("bench");
for (let i = 0; i < 10000; i++) {
  z.string().catch("asdf").parse(5);
}
console.timeEnd("bench");
