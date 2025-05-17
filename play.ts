import { z } from "zod/v4";

z;

const schema = z.object({
  name: z.string(),
  logLevel: z.union([z.string(), z.number()]),
  env: z.literal(["production", "development"]),
});

const data = {
  name: 1000,
  logLevel: false,
};

const result = schema.safeParse(data);

console.dir(z.prettifyError(result.error!), { depth: null });
