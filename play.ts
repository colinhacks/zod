import { z } from "zod/v4";

const a = z.object({
  name: z.string().meta({ id: "first_name" }),
  email: z.string().email().meta({ id: "email_address" }),
});

const result = z.toJSONSchema(z.globalRegistry, {
  uri: (id) => `https://example.com/${id}.json`,
});
console.dir(result, { depth: null });
