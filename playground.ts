import { z } from "./src";

console.time("parse");
// for (let i = 0; i < 1000000; i++) {
//   z.string().safeParse(123);
// }
const result = z.string().safeParse(123);
if (result.success === false) {
  console.log(result.error);
  console.log(result.error === result.error);
}
console.timeEnd("parse");
