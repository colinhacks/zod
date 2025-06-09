import { z } from "zod/v4";
import type { ZodArray, ZodDiscriminatedUnion } from "zod/v4";

export const SegmentFilter = z.object({
  type: z.literal("segment"),
  id: z.string(),
});

export type SegmentFilter = z.infer<typeof SegmentFilter>;
