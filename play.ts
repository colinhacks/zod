import * as z from "zod/v4";

const stringPlusA = z.string().overwrite((val) => val + "a");
const A = z
  .codec(stringPlusA, stringPlusA, {
    decode: (val) => val,
    encode: (val) => val,
  })
  .overwrite((val) => val + "a");

console.log(z.encode(A, ""));
// A.parse("world");
