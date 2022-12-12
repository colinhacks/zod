import { z } from "./src";

console.log(z.coerce.boolean().parse("tuna")); // => true
console.log(z.coerce.boolean().parse("true")); // => true
console.log(z.coerce.boolean().parse("false")); // => true
console.log(z.coerce.boolean().parse(1)); // => true
console.log(z.coerce.boolean().parse([])); // => true

console.log(z.coerce.boolean().parse(0)); // => false
console.log(z.coerce.boolean().parse(undefined)); // => false
console.log(z.coerce.boolean().parse(null)); // => false
