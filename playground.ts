import { z } from "./src";

z;

const schema = z
  .string()
  .transform((input) => input || undefined)
  .optional()
  .default("default");

type Input = z.input<typeof schema>; // string | undefined
type Output = z.output<typeof schema>; // string

const result = schema.safeParse("");

console.log(result); // { success: true, data: undefined }
