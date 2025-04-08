import * as z from "zod";

console.log(z.array(z.string()).max(2).safeParse([1, 2, 3, 4]));
