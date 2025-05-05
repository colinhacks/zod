import * as z from "zod";

const schema = z.object({
  a: z.string(),
  b: z.number(),
  c: z.boolean(),
});

const test: z.core.$ZodObject = schema;
// ___^^^^^
