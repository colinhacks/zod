import { z } from "zod/v4";

// z;

// const A = z.object({
//   type: z.literal("A"),
//   get next(): z.ZodDiscriminatedUnion<[typeof A, typeof B]> {
//     return z.discriminatedUnion([A, B]);
//   },
// });

// const B = z.object({
//   type: z.literal("B"),
// });

// const AB: z.ZodDiscriminatedUnion<[typeof A, typeof B]> = z.discriminatedUnion([A, B]);

// import { z } from "zod/v4";

const Activity = z.object({
  name: z.string(),
  get subactivities(): z.ZodUnion<[z.ZodNull, typeof Activity]> {
    return z.union([z.null(), Activity]);
  },
});
