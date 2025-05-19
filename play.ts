import * as z from "zod/v4";

// const MyFunction = z.function({
//   input: [z.string()],
//   // output: z.number(),
// });

// const computeLength = MyFunction.implement((name) => name.length);

const coercedInt = z.preprocess((val) => {
  if (typeof val === "string") {
    return Number.parseInt(val);
  }
  return val;
}, z.int());

console.dir(coercedInt.parse("123"), { depth: null }); // 123
