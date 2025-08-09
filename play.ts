import { z } from "zod/v4";

z;

console.log(
  z
    .object({
      a: z.string(),
    })
    .transform((data) => {
      return {
        ...data,
        tx: true,
      };
    })
    .safeParse({ a: "1" })
);
