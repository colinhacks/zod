import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-mini";
import * as z3 from "../benchmarks/node_modules/zod3/lib/index.js";

const DATA = makeData(1000, () => ({
  a: randomString(10),
  b: randomString(10),
  c: randomString(10),
}));

const schema = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
});

const schemav3 = z3.object({
  a: z3.string(),
  b: z3.string(),
  c: z3.string(),
});

// console.log(
//   schemav3.par({
//     data: {
//       a: "a",
//       b: "b",
//       c: 234,
//     },
//     ''
//     path:[]

//   })
// );
console.log(
  schemav3.safeParse({
    a: "a",
    b: "b",
    c: 234,
  })
);
console.log(
  schema._parse({
    a: "a",
    b: "b",
    c: 1234,
  })
);

console.log(
  schema._parse2({
    a: "a",
    b: "b",
    c: 1234,
  })
);

const bench = metabench("parse-signatures", {
  _parse_v3() {
    for (const _ of DATA) schemav3.safeParse(_);
  },
  _parse() {
    for (const _ of DATA) schema.safeParse(_);
  },
  _parse2() {
    for (const _ of DATA) schema._parse2(_);
  },
});

await bench.run();
