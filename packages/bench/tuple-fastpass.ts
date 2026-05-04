import * as z from "../zod/src/v4/index.js";
import { makeData } from "./benchUtil.js";
import { metabench } from "./metabench.js";

// Toggle JIT off for the "before" baseline comparison.
// Comment-in to bench the interpreter path:
// z.config({ jitless: true });

const small = z.tuple([z.string(), z.number(), z.boolean()]);
const smallData = makeData(1000, () => [`${Math.random()}`, Math.random(), Math.random() > 0.5]);

const wide = z.tuple([
  z.string(),
  z.number(),
  z.boolean(),
  z.string(),
  z.number(),
  z.boolean(),
  z.string(),
  z.number(),
]);
const wideData = makeData(1000, () => [
  `${Math.random()}`,
  Math.random(),
  Math.random() > 0.5,
  `${Math.random()}`,
  Math.random(),
  Math.random() > 0.5,
  `${Math.random()}`,
  Math.random(),
]);

const withRest = z.tuple([z.string(), z.number()], z.boolean());
const restData = makeData(1000, () => [`${Math.random()}`, Math.random(), true, false, true]);

await metabench("tuple — 3 items (sync)", {
  parse() {
    for (const _ of smallData) small.parse(_);
  },
}).run();

await metabench("tuple — 8 items (sync)", {
  parse() {
    for (const _ of wideData) wide.parse(_);
  },
}).run();

await metabench("tuple — 2 items + rest", {
  parse() {
    for (const _ of restData) withRest.parse(_);
  },
}).run();
