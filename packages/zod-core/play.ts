import * as z from "zod-core";

z;

const a = z.custom((val) => {
  return typeof val === "string";
}, {});

console.log(a["~def"].fn("asdf"));
console.log(a["~def"].fn(123));
console.log(z.safeParse(a, "asdf"));
console.log(z.safeParse(a, 123));

console.log(a["~parse"]);
