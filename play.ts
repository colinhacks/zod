import { z } from "zod/v4";

const schema = z.discriminatedUnion(
  "foo",
  [
    z.object({
      foo: z.literal("x"),
      x: z.string(),
    }),
    z.object({
      foo: z.literal("y"),
      y: z.string(),
    }),
  ],
  {
    error: "Invalid discriminator",
  }
);

const error = schema.safeParse({ foo: "invalid" }).error;
console.log("error:", error);
console.dir(z.treeifyError(error!), { depth: null });
