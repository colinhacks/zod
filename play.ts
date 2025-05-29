import { z } from "zod/v4";

const Success = z.object({ status: z.literal("success"), data: z.string() });
const Failure = z.object({ status: z.literal("fail"), message: z.string() });
const MyResult = z.discriminatedUnion("status", [Success, Failure]);

console.dir(Success._zod.propValues, { depth: null });
// { status: Set(1) { 'success' } }

console.dir(Failure._zod.propValues, { depth: null });
// { status: Set(1) { 'fail' } }

console.log(MyResult._zod.propValues);
// { status: Set(1) { 'success', 'fail' } }

for (const o of MyResult._zod.def.options) {
  console.dir(o._zod.propValues[MyResult._zod.def.discriminator], { depth: null });
}
