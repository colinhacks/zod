import { z } from "zod/v4";
import type { ZodArray, ZodDiscriminatedUnion } from "zod/v4";

export const SegmentFilter = z.object({
  type: z.literal("segment"),
  id: z.string(),
});

export type SegmentFilter = z.infer<typeof SegmentFilter>;

export const ParticipantFilter = z.object({
  type: z.literal("participant"),
  id: z.string(),
});

export type ParticipantFilter = z.infer<typeof ParticipantFilter>;

export const AndFilter = z.object({
  type: z.literal("and"),
  get filters(): ZodArray<
    ZodDiscriminatedUnion<
      [typeof SegmentFilter, typeof ParticipantFilter, typeof AndFilter, typeof OrFilter, typeof NotFilter]
    >
  > {
    return z.discriminatedUnion("type", [SegmentFilter, ParticipantFilter, AndFilter, OrFilter, NotFilter]).array();
  },
});
export type AndFilter = z.infer<typeof AndFilter>;

export const OrFilter = z.object({
  type: z.literal("or"),
  get filters(): ZodArray<
    ZodDiscriminatedUnion<
      [typeof SegmentFilter, typeof ParticipantFilter, typeof AndFilter, typeof OrFilter, typeof NotFilter]
    >
  > {
    return z.discriminatedUnion("type", [SegmentFilter, ParticipantFilter, AndFilter, OrFilter, NotFilter]).array();
  },
});
export type OrFilter = z.infer<typeof OrFilter>;

export const NotFilter = z.object({
  type: z.literal("not"),
  get filter(): ZodDiscriminatedUnion<
    [typeof SegmentFilter, typeof ParticipantFilter, typeof AndFilter, typeof OrFilter, typeof NotFilter]
  > {
    return z.discriminatedUnion("type", [SegmentFilter, ParticipantFilter, AndFilter, OrFilter, NotFilter]);
  },
});
export type NotFilter = z.infer<typeof NotFilter>;

export const RowFilter = z.discriminatedUnion("type", [
  SegmentFilter,
  ParticipantFilter,
  AndFilter,
  OrFilter,
  NotFilter,
]);
export type RowFilter = z.infer<typeof RowFilter>;

const data: RowFilter = {
  type: "and",
  filters: [
    { type: "segment", id: "foo" },
    { type: "participant", id: "bar" },
  ],
};

const parsed = RowFilter.parse(data);

console.log(parsed);
