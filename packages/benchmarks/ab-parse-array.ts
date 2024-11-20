import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-mini";

const schema = z.array(z.string());

const DATA = makeData(1000, () => [
  randomString(10),
  randomString(10),
  randomString(10),
]);

console.log(z.parse(schema, DATA[0]));
// console.log(z.parse2(schema, DATA[0]));
// console.log(z.parse3(schema, DATA[0]));

const bench = metabench("AB test: objects", {
  _parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
});

await bench.run();
