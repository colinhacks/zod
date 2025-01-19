import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod";

const schema = z.string();

const DATA = makeData(1000, () => randomString(10));

console.log(schema.parse(DATA[0]));
console.log(schema.parse2(DATA[0], { skipFast: true }));

const bench = metabench("fast parse: strings", {
  fast() {
    for (const _ of DATA) schema.parse(_);
  },
  noFast() {
    for (const _ of DATA) schema.parse(_, { skipFast: true });
  },
});

await bench.run();
