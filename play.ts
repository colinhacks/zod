import * as z from "zod";

console.dir(z.number().min(0).safeParse(-1), { depth: null });
