import { z } from "./src";

const schema = z.object({
  a: z.string(),
  b: z.string().catch("b"),
});

const result = schema.safeParse({
  a: {},
  b: 3,
});

console.log(result);
