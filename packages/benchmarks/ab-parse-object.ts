import { makeData, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";

import * as z from "zod-core";

const schema = z.object({
  a: z.string(),
  // b: z.string(),
  // c: z.string(),
  // d: z.string(),
  // e: z.string(),
  // f: z.string(),
  // g: z.string(),
  // h: z.string(),
  // i: z.string(),
  // j: z.string(),
  // k: z.string(),
  // l: z.string(),
  // m: z.string(),
  // n: z.string(),
  // o: z.string(),
  // p: z.string(),
  // q: z.string(),
  // r: z.string(),
});

const DATA = makeData(1000, () => ({
  a: randomString(10),
  // b: randomString(10),
  // c: randomString(10),
  // d: randomString(10),
  // e: randomString(10),
  // f: randomString(10),
  // g: randomString(10),
  // h: randomString(10),
  // i: randomString(10),
  // j: randomString(10),
  // k: randomString(10),
  // l: randomString(10),
  // m: randomString(10),
  // n: randomString(10),
  // o: randomString(10),
  // p: randomString(10),
  // q: randomString(10),
  // r: randomString(10),
}));

// console.log(z.parse(schema, DATA[0]));
console.log(z.safeParse(schema, DATA[0]));
console.log(z.safeParseB(schema, DATA[0]));
console.log(z.safeParseC(schema, DATA[0]));

// console.log(z.parse2(schema, DATA[0]));
// console.log(z.parse3(schema, DATA[0]));

const bench = metabench("AB test: objects", {
  _parseC() {
    for (const _ of DATA) z.safeParseC(schema, _);
  },
  _parse() {
    for (const _ of DATA) z.safeParse(schema, _);
  },
  _parseB() {
    for (const _ of DATA) z.safeParseB(schema, _);
  },
});

await bench.run();
