import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-mini";

const schema = z.record(z.string(), z.number());

const DATA = makeData(1000, () => ({
  a: Math.random(),
  b: Math.random(),
  c: Math.random(),
}));

console.log(z.parse(schema, DATA[0]));

const bench = metabench("AB test: objects", {
  _parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
  // _parse2() {
  //   for (const _ of DATA) z.parse2(schema, _);
  // },
  // _parse3() {
  //   for (const _ of DATA) z.parse3(schema, _);
  // },
});

await bench.run();
