import { z } from "zod";

z;

const arg = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("play"),
    id: z.string(),
    name: z.string(),
    duration: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("pause"),
    id: z.string(),
    reason: z.string().optional(),
  }),
]);

arg.def;
