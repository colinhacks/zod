import { makeData } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "@zod/mini";

const DATA = makeData(1000, () => 10 * Math.random());

const schema = z.number([
  // z.gt(0),
  // z.lt(10),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
  // z.gt(0),
]);

console.log(schema._parse(15));

const bench = metabench("check-signatures", {
  parse() {
    for (const _ of DATA) schema._parse(_);
  },
  parse2() {
    for (const _ of DATA) schema._parse2(_);
  },
});

await bench.run();
