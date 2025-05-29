import { z } from "zod/v4";

z;
const a = z
  .string()
  .transform((val) => val.length)
  .default(5);

console.dir(z.toJSONSchema(a, { io: "input" }), { depth: null });
