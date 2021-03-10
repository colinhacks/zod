import * as z from "./index.ts";

const schema = z.union([
  z.object({
    a: z.string(),
  }),
  z.object({
    b: z.boolean(),
  }),
]);

schema.parse({ b: "test" });

export {};

z.string().nonempty();
z.literal("");
