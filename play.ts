import * as z from "zod/v4";

const B = z
  .codec(z.string().trim(), z.string().max(4), {
    decode: (val) => val,
    encode: (val) => val,
  })
  .check(z.trim());

console.log(z.decode(B, " asdf "));
console.log(z.encode(B, " asdf "));
