import * as z from "zod";

z;

import { Doc } from "../zod-core/src/doc.js";

// const a = z.string();
const a = z.object({
  a: z.string(),
  // b: z.number(),
  // c: z.boolean(),
});

const data = {
  a: "asdf",
  // b: 123,
  // c: true,
};

const doc = Doc.build(a, { execution: "sync" });
console.log(doc.toString());
console.log(doc(data));
// console.log(doc(data));
// console.log(doc(data));
// console.log(a._parse(data));
// console.log(doc(123));
