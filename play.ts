import * as z from "zod/v4";

// console.dir(z.email()._zod.bag.pattern, { depth: null });
// console.dir(z.email().def.pattern, { depth: null });
// console.dir(z.email()._zod.pattern, { depth: null });

const BaseError = { status: z.literal("failed"), message: z.string() };
const MyErrors = z.discriminatedUnion("code", [
  z.object({ ...BaseError, code: z.literal(400) }),
  z.object({ ...BaseError, code: z.literal(401) }),
  z.object({ ...BaseError, code: z.literal(500) }),
]);

const MyResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  MyErrors,
]);

console.dir(
  MyResult.parse({
    status: "failed",
    code: 401,
    message: "asdf",
  }),
  { depth: null }
);
