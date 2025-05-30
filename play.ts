import { z } from "zod/v4-mini";

const Thing = z
  .object({
    name: z.string(),
    age: z.number(),
  })
  .check(({ value, issues }) => {
    value; // => any
  });
