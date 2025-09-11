import z from "zod";

z.object({
  inner: {
    a: z.number(),
  },
}).parse({ inner: { a: 1 } });
