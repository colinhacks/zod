import { randomUUID } from "node:crypto";
import { makeData } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-mini";
// import * as z3 from "./node_modules/zod3/lib/index.js";

const DATA = makeData(1000, () => randomUUID());

const schema = z.uuid();
console.log(z.parse(schema, randomUUID()));

const bench = metabench("AB test: uuid", {
  _parse() {
    for (const _ of DATA) z.parse(schema, _);
  },
});

await bench.run();
