import { z } from "zod/v4";

z;

export const createV4Schema = <Output>(opts: {
  schema: z.ZodType<Output>;
}) => {
  return opts.schema;
};

createV4Schema({
  schema: z.object({
    name: z.string(),
  }),
})._zod.output.name;
