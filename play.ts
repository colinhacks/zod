import * as z from "zod";

const schema = z.object({
  a: z.string().default("tsuna").optional(),
});

console.log(schema.parse({}));
// Zod 4 => { a: "tuna" }
// Zod 3 => {}
