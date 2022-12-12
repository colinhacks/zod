import { z } from "./src";

const schema = z.object({
  birth_date: z.date().optional(),
});

schema.parse({});
