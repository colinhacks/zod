import * as z from "zod";

const zItemTest = z.union([
  z.object({
    date: z.number(),
    startDate: z.optional(z.null()),
    endDate: z.optional(z.null()),
  }),
  z
    .object({
      date: z.optional(z.null()),
      startDate: z.number(),
      endDate: z.number(),
    })
    .refine((data) => data.startDate !== data.endDate, {
      error: "startDate and endDate must be different",
      path: ["endDate"],
    }),
]);

const res = zItemTest.safeParse({
  date: null,
  startDate: 1,
  endDate: 1,
});

console.log(res);
