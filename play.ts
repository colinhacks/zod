import * as z from "zod/v4";

// console.dir(z.literal("asdf").optional()._zod.values, { depth: null });

const BaseError = z.object({ status: z.literal("failed"), message: z.string() });
const MyErrors = z.discriminatedUnion("code", [
  BaseError.extend({ code: z.literal(400) }),
  BaseError.extend({ code: z.literal(401) }),
  BaseError.extend({ code: z.literal(500) }),
]);

const MyResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  MyErrors,
]);

const result = MyResult.parse({ status: "success", data: "hello" });
console.log(result); // { status: 'success', data: 'hello' }
const result2 = MyResult.parse({ status: "failed", code: 400, message: "bad request" });
console.log(result2); // { status: 'failed', code: 400, message: 'bad request' }
const result3 = MyResult.parse({ status: "failed", code: 401, message: "unauthorized" });
console.log(result3); // { status: 'failed', code: 401, message: 'unauthorized' }
const result4 = MyResult.parse({ status: "failed", code: 500, message: "internal server error" });
console.log(result4); // { status: 'failed', code: 500, message: 'internal server error' }
