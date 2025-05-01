import * as z from "zod";

const schema = z.object({
  a: z.number(),
  b: z.number().int(),
  c: z.number().positive(),
});

console.log(
  schema.parse({
    a: 1,
    b: 2,
    c: 3,
  })
); // { a: 1, b: 2, c: 3 }
