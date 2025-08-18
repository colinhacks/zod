import * as z from "zod/v4";

const A = z.codec(z.string(), z.string().trim(), {
  decode: (val) => val,
  encode: (val) => val,
});

console.log(z.decode(A, " asdf "));
console.log(z.encode(A, " asdf "));
