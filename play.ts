import { z } from "zod/v4";

// import { z } from "zod/v4";

export const elementInputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("CONTAINER"),
    }),
    z.object({
      type: z.literal("SCREEN"),
      config: z.object({ x: z.number(), y: z.number() }),
    }),
  ])
  .and(
    z.object({
      get children(): z.ZodOptional<z.ZodArray<typeof elementInputSchema>> {
        return z.array(elementInputSchema).optional();
      },
    })
  );

export type ElementInput = z.infer<typeof elementInputSchema>;
