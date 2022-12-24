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

console.log(
  z
    .object({
      first: z.string().catch("first"),
      second: z.string().catch("second"),
    })
    .parse(undefined)
);

z.bigint().gt(5n);
z.bigint().gte(5n); // alias `.min(5n)`
z.bigint().lt(5n);
z.bigint().lte(5n); // alias `.max(5n)`

z.bigint().positive(); // > 0n
z.bigint().nonnegative(); // >= 0n
z.bigint().negative(); // < 0n
z.bigint().nonpositive(); // <= 0n

z.bigint().multipleOf(5n); // Evenly divisible by 5n.
