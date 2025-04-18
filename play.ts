import * as z from "@zod/mini";

console.log(z.toJSONSchema(z.literal(undefined), { unrepresentable: "any" }));

const A = z.partialRecord(z.enum(["a", "b"]), z.number());
type A = z.infer<typeof A>;
