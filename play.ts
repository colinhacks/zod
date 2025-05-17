import { z } from "zod/v4";

z;

const schema = z.strictObject({
  username: z.string(),
  favoriteNumbers: z.array(z.number()),
});

const result = schema.parse({
  username: 1234,
  favoriteNumbers: [1234, "4567"],
  extraKey: 1234,
});

console.dir(result.error, { depth: null });
