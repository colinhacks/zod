import { z } from "./src";

z;

const Schema = z
  .object({
    limit: z.number().default(0),
  })
  .default({});
type Schema = z.infer<typeof Schema>;
