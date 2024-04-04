import { z } from "./src";

z.string();

z.array(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

z.coerce.bigint();

z.union([z.string(), z.number()]);
z.union([z.string(), z.number()]);
const lit = z
  .templateLiteral()
  .literal("https://")
  .interpolated(z.string())
  .literal(".com");
