import * as z from "zod/v4";

const schema = z.object({
  a: z.string().prefault("tuna").optional(),
});

console.log(schema.parse({}));
// Zod 4 => { a: "tuna" }
// Zod 3 => {}
