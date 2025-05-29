import * as z from "zod/v4-mini";

export const PlaySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("play"), id: z.string() }),
  z.object({ type: z.literal("play2"), name: z.string() }),
]);

PlaySchema.parse({ type: "play", id: "123" }); // valid
