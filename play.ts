import { z } from "zod/v4";

// // disc union with duplicate discriminators
// export const PlaySchema = z.discriminatedUnion("type", [
//   z.object({ type: z.literal("play"), id: z.string() }),
//   z.object({ type: z.literal("play2"), name: z.string() }),
// ]);

// PlaySchema.parse({ type: "play", id: "123" }); // valid

const BaseError = z.object({ status: z.literal("failed"), message: z.string() });

const MyResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.discriminatedUnion("code", [
    BaseError.extend({ code: z.literal(400) }),
    BaseError.extend({ code: z.literal(401) }),
    BaseError.extend({ code: z.literal(500) }),
  ]),
]);
console.dir(MyResult._zod.propValues, { depth: null });
