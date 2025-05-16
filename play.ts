import { z } from "zod/v4";

const schema = z.preprocess((data, ctx) => {
  ctx.addIssue({
    code: "custom",
    message: `custom error`,
  });
  return data;
}, z.string());
const result = schema.safeParse(1234);

console.dir(result.error!, { depth: null });
