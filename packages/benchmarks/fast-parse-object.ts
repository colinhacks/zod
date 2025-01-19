import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod";

const schema = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

const DATA = makeData(1000, () => ({
  a: randomString(10),
  b: randomString(10),
  c: randomString(10),
}));

console.log(schema.parse(DATA[0]));
console.log(schema.parse2(DATA[0], { skipFast: true }));

const bench = metabench("AB test: objects", {
  fast() {
    for (const _ of DATA) schema.parse(_);
  },
  skipFast() {
    for (const _ of DATA) schema.parse(_, { skipFast: true });
  },
});

await bench.run();
