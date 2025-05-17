import * as z from "zod/v4";

const schema = z.object({
  a: z.string().optional(),
  b: z.string(),
});

console.dir(schema.safeParse({ a: "asdf", b: "qwer" }), { depth: null });
console.dir(schema.safeParse({ a: "asdf", b: "qwer" }, { jitless: true }), { depth: null });
