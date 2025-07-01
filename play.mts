import * as z from "zod/v4";

// biome-ignore lint:
const Story = z.object({
  type: z.literal("story"),
  story: z.object({
    name: z.string(),
  }),
});
Story;

const Collection = z.object({
  type: z.literal("collection"),
  get items(): z.ZodArray<z.ZodUnion<readonly [typeof Story, typeof Collection]>> {
    return z.array(z.union([Story, Collection]));
  },
});

// biome-ignore lint:
type Collection = z.infer<typeof Collection>;
