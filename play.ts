import * as z from "zod";

const b = z.literal(["hello", undefined, null, 5, BigInt(1324)]);
const res = z.toJSONSchema(b);
console.log(res);
