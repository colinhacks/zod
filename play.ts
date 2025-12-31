import * as z from "./packages/zod/src/v4/index.js";

const A = z.object({
  a: z.string().optional(),
});

console.log(A.parse({}));
