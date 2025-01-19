import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod";
// import * as z3 from "./node_modules/zod3/lib/index.js";

const DATA = makeData(1000, () => randomString(10));

const schema = z.string();
console.log(schema.parse("asdf"));
console.log(schema.parse2("asdf"));

const bench = metabench("AB test: strings", {
  parse() {
    for (const _ of DATA) schema.parse("asdf");
  },
  parse2() {
    for (const _ of DATA) schema.parse2("asdf");
  },
});

await bench.run();
