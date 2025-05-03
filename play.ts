import * as z from "zod";

const Z = z.record(z.templateLiteral(["zod", z.string()]), z.number()).and(
  z.object({
    root: z.array(z.union([z.string(), z.number()])),
    nested: z.object({
      a: z.literal(true),
    }),
    inlined: z
      .object({
        b: z.literal(false),
      })
      .readonly()
      .optional(),
  })
);
