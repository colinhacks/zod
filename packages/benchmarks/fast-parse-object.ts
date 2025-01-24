import { Doc } from "../zod-core/src/doc.js";
import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-core";

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

console.log(z.parse(schema, DATA[0]));
console.log(z.parseB(schema, DATA[0]));

const bench = metabench("AB test: objects", {
  parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
  fastparse() {
    for (const _ of DATA) z.parseB(schema, _);
  },
  // fastrun() {
  //   for (const _ of DATA) schema["~fastrun"](_);
  // },
  // "z.parse"() {
  //   for (const _ of DATA) z.parse(schema, _);
  // },
});

await bench.run();
