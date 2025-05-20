import z3 from "zod/v3";
import z4 from "zod/v4";

console.log("before (v3): ", z3.string().safeParse(123).error);
console.log("after (v4):", z4.string().safeParse(123).error);