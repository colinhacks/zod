import { z } from "./src";

// console.log(z.coerce.boolean().parse("tuna")); // => true
// console.log(z.coerce.boolean().parse("true")); // => true
// console.log(z.coerce.boolean().parse("false")); // => true
// console.log(z.coerce.boolean().parse(1)); // => true
// console.log(z.coerce.boolean().parse([])); // => true

// console.log(z.coerce.boolean().parse(0)); // => false
// console.log(z.coerce.boolean().parse(undefined)); // => false
// console.log(z.coerce.boolean().parse(null)); // => false

const p = z.object({
  first: z.string({ label: "First Name", }).min(3, {}),
  last: z.number({})
})

const d = p.parse({ first: "12", last: 12 })
console.log(d);

// z.number().catch(() => (Array.isArray(e) ? e.length : -1));

// type keyType = keyof any;
// // string | number | symbol

// const anyObject = z.record(
//   z.string().or(z.number()).or(z.symbol()),
//   z.unknown()
// );

// const stringifiable = z.record(z.literal(Symbol.toStringTag), z.function());
// const arg = stringifiable.parse("");
// arg.toString();

// console.log(
//   z
//     .object({
//       first: z.string().catch("first"),
//       second: z.string().catch("second"),
//     })
//     .parse(undefined)
// );
