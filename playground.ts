import { z } from "./src";
const example1 = z.custom<number>((x) => typeof x === "number");
example1.parse("asdf");
// const example1 = z
//   .custom<number>(
//     (x) => {
//       console.log(`custom`);
//       console.log(x);
//       return typeof x === "number";
//     },
//     {},
//     true
//   )
//   .transform((x) => {
//     console.log(`transform`);
//     console.log(x);
//     return String(x);
//   })
//   .refine((x) => {
//     console.log(`refine`);
//     console.log(x);
//     console.log(typeof x); // prints 'Object'
//     console.log("I get called even though I shouldn't!!!");
//     return true;
//   })
//   .safeParse({}); //will fail because it is not a number

// console.log(example1.success); // false (like it should be)
