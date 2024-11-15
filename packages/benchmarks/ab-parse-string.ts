import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-mini";
// import * as z3 from "./node_modules/zod3/lib/index.js";

const DATA = makeData(1000, () => randomString(10));

const schema = z.string();
console.log(z.parse(schema, "asdf"));
console.log(z.parse2(schema, "asdf"));

const bench = metabench("AB test: strings", {
  _parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
  _parse2() {
    for (const _ of DATA) z.parse2(schema, _);
  },
  _parse3() {
    for (const _ of DATA) z.parse3(schema, _);
  },
});

await bench.run();
