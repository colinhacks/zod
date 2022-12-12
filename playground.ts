import { z } from "./src";

console.log(z.coerce.boolean().parse("tuna")); // => true
console.log(z.coerce.boolean().parse("true")); // => true
console.log(z.coerce.boolean().parse("false")); // => true
console.log(z.coerce.boolean().parse(1)); // => true
console.log(z.coerce.boolean().parse([])); // => true

console.log(z.coerce.boolean().parse(0)); // => false
console.log(z.coerce.boolean().parse(undefined)); // => false
console.log(z.coerce.boolean().parse(null)); // => false

z.object({
  first: z.string(),
  last: z.string(),
}).transform((val) => ({
  ...val,
  full: `${val.first} ${val.last}`,
}));

z.number().catch(() => (Array.isArray(e) ? e.length : -1));
