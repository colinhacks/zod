import * as z from "zod/v4";

const A = z.string().meta({ a: true });
console.dir(A.meta(), { depth: null });
const B = A.meta({ b: true });
console.dir(B.meta(), { depth: null });
const C = B.describe("hello");
console.dir(C.meta(), { depth: null });
// console.dir(C._zod.parent._zodreg, { depth: null });
