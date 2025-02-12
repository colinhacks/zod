import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "@zod/core";
// import * as z3 from "./node_modules/zod3/lib/index.js";

const DATA = makeData(1000, () => randomString(25));

const schema = z.string([
  z.refine((val) => val.length > 20, {
    error: "too long #1",
    abort: true,
  }),
  z.refine((val) => val.length > 20, {
    error: "too long #2",
    abort: true,
  }),
  z.refine((val) => val.length > 20, {
    error: "too long #3",
    abort: true,
  }),
]);
console.log(z.parse(schema, DATA[0]));

const bench = metabench("AB test: multiple checks", {
  _parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
});

await bench.run();
