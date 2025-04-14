import * as z from "zod";

const Schema = z.object({
  limit: z.int().default(0),
});
type Schema = z.infer<typeof Schema>;
