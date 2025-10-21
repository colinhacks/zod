import * as z from "zod";

const a = z.uint32();
console.log(a.parse(1234));

const arg = z
  .object({
    a: z.string(),
    b: z.string(),
  })
  .pick({} as Record<string, true>);

arg.parse({});
