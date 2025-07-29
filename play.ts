import * as z from "zod";

z;

const schema = z.object({
  id: z
    .union([z.number(), z.string().nullish()])
    .transform((val) => (val === null || val === undefined ? val : Number(val)))
    .pipe(z.number())
    .optional(),
});

console.log(schema.safeParse({}, { jitless: true }));
