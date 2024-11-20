import * as z from "zod-core";

const a = z.enum(["a", "b", "c"]);
a.enum;

console.log(a);
