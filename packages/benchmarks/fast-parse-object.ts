import { Doc } from "../zod-core/src/doc.js";
import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod";

const schema = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
  d: z.string(),
  e: z.string(),
  f: z.string(),
});

const doc = Doc.build(schema, { execution: "sync" });

const DATA = makeData(1000, () => ({
  a: randomString(10),
  b: randomString(10),
  c: randomString(10),
  d: randomString(10),
  e: randomString(10),
  f: randomString(10),
}));

console.log(schema["~parse"](DATA[0]));
console.log(doc(DATA[0]));

// const bench = metabench("AB test: objects", {
//   parse() {
//     for (const _ of DATA) schema["~parse"](_);
//   },
//   fastparse() {
//     for (const _ of DATA) schema["~fparse"](_);
//   },
// });

console.log(doc.toString());

const bench = metabench("AB test: objects", {
  parse() {
    for (const _ of DATA) schema["~parse"](_);
  },
  fastparse() {
    for (const _ of DATA) doc(_);
  },
  // fastrun() {
  //   for (const _ of DATA) schema["~fastrun"](_);
  // },
  // "z.parse"() {
  //   for (const _ of DATA) z.parse(schema, _);
  // },
});

await bench.run();
