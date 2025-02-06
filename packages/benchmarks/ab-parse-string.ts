import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-core";

const DATA = makeData(10000, () => randomString(10));

const schema = z.string().check(z.minLength(5));

console.log(z.safeParse(schema, "asdfasdf"));
console.log(z.safeParseB(schema, "asdfasdf"));

const bench = metabench("AB test: strings", {
  parse() {
    for (const _ of DATA) z.safeParse(schema, _);
  },
  parseB() {
    for (const _ of DATA) z.safeParseB(schema, _);
  },
  // parseC() {
  //   for (const _ of DATA) z.safeParseC(schema, _);
  // },
});

await bench.run();
