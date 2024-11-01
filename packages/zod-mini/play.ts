import * as z from "./src/index.js";

const a = z.discriminatedUnion([
  z.object({
    type: z.literal("A"),
    name: z.string(),
  }),
  z.object({
    type: z.literal("B"),
    age: z.number(),
  }),
]);

// a._discriminators;

const aa = z.object({
  type: z.literal("A"),
  name: z.string(),
});

a._values;
