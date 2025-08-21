import * as z from "zod/v4";

const A = z.discriminatedUnion("type", [
  z.object({
    type: z.number(),
    a: z.string(),
  }),
  z.object({
    type: z.string(),
    b: z.string(),
  }),
]);

A.parse({ type: 1, a: "a" });
A.parse({ type: "b", b: "b" });
