import * as z from "zod";
z;

const a = z.object({ a: z.string() });
const _ = a.parse({ a: "123" });

const data = a.parse({ a: "345" });
console.log(data);
