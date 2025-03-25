import * as z from "zod";

const schema = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
console.log(
  schema.parse({
    a: "asdf",
    b: 123,
    c: true,
  })
);
