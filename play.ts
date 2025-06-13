import { z } from "zod/v4";

z;

const file = z
  .file()
  .max(5_000_000, { message: "File too large (max 5MB)" })
  .mime(["image/png", "image/jpeg"], { error: "Only PNG and JPEG allowed" })
  .optional();

// test parsing with invalid mime
const f = new File([""], "test.txt", {
  type: "text/plain",
});
file.parse(f);

const Story = z.object({
  type: z.literal("story"),
  story: z.looseObject({}),
});

const Collection = z.object({
  type: z.literal("collection"),
  get items(): z.ZodArray<z.ZodDiscriminatedUnion<[typeof Story, typeof Collection]>> {
    return z.array(z.discriminatedUnion("type", [Story, Collection]));
  },
});

type Collection = z.infer<typeof Collection>;

const ActivityUnion = z.union([
  z.object({
    name: z.string(),

    // now it's `any` though the whole object is exactly the same
    get subactivities(): z.ZodNullable<z.ZodArray<typeof ActivityUnion>> {
      return z.nullable(z.array(ActivityUnion));
    },
  }),
  z.string(),
]);

type A = z.infer<typeof ActivityUnion>;
