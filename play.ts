import * as z from "zod";

z;

const a = z.looseObject({
  a: z.string(),
});

const b = z.strictObject({ b: z.string() });
const c = a.merge(b);
// incoming object overrides
console.log(a._def);
console.log(b._def);

console.log(c._def);
