import * as z from "zod";

z;
const schema = z
  .object({
    name: z.string(), //.refine((val) => val.toLowerCase() === val, "bad name"),
    prop: z.number(),
  })
  .refine((val) => val.prop > 10, "bad object");

schema.parse({ name: 1234, prop: 5 });
