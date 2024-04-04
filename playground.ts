import { z } from "./src";

z.string();

z.array(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

z.coerce.bigint();
