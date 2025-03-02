import * as z from "zod";

z;

const schema = z.object({
  type: z.literal("a"),
  a: z
    .string()
    .refine(async () => true)
    .transform((val) => Number(val)),
});
const data = { type: "a", a: "1" };
const result = await schema.safeParseAsync(data);
console.log(JSON.stringify(result, null, 2));

z.email({})._zod;
z.object({});
z.guid();
