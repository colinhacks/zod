import * as z from "zod";
z;

const a = z.object({ a: z.string() });
const _ = a.parse({ a: "123" });

const data = a.parse({ a: "345" });
console.log(data);

z.literal("a").values;

// z.string().regex

z.string();

z.url();
z.base64();

z.string().datetime;
