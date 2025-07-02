import * as z from "zod/v4";

console.log(z.string().default("default").optional().parse(undefined)); // should return "default"
