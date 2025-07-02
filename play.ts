import * as z from "zod/v4";

const unionSchema = z.union([z.string(), z.number()]);
const baseSchema = z.object({
  id: z.string(),
});

const extendedSchema = baseSchema.extend(unionSchema);
type ExtendedSchema = z.infer<typeof extendedSchema>;
