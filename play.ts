import * as z from "zod";

// import { z } from "zod/v4";

export const A = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CONTAINER"),
  }),
  z.object({
    type: z.literal("SCREEN"),
    config: z.object({ x: z.number(), y: z.number() }),
  }),
]);
type A = z.infer<typeof A>;

const B = z.object({
  get children() {
    return z.array(C).optional();
  },
});
type B = z.infer<typeof B>;

const C = z.intersection(A, B);
type C = z.infer<typeof C>;

export type ElementInput = z.infer<typeof C>;
