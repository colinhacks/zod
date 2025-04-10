import * as z from "zod";

export const a = z.object({
  x: z.string(),
  y: z.number(),
});

export type A = z.infer<typeof a>; // ✅ Correctly inferred

export const b = a.extend({
  z: z.boolean().optional(),
});

export type B = z.infer<typeof b>; // ❌ Inferred as just `object`
