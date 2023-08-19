import { z } from "./src";

z;

const schema = z.object({
  name: z.string(),
  value: z.string(),
});

const schemaRefine = schema.superRefine(async (val, _ctx) => {
  return val.value !== "INVALID";
});
