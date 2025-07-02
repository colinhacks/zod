import * as z from "zod/v4";

// const Story = z.object({
//   type: z.literal("story"),
//   story: z.object({
//     name: z.string(),
//   }),
// });
// Story;

// const Collection = z.object({
//   type: z.literal("collection"),
//   get items(): z.ZodArray<z.ZodUnion<readonly [typeof Story, typeof Collection]>> {
//     return z.array(z.union([Story, Collection]));
//   },
// });

// // biome-ignore lint:
// type Collection = z.infer<typeof Collection>;
const unionSchema = z.union([z.string(), z.number()]);
const baseSchema = z.object({
  id: z.string(),
});

const extendedSchema = baseSchema.extend(unionSchema);
type ExtendedSchema = z.infer<typeof extendedSchema>;
console.log(extendedSchema);
console.log(extendedSchema.shape);
