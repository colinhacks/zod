import * as z from "@zod/mini";

console.log(z.toJSONSchema(z.literal(undefined), { unrepresentable: "any" }));

const A = z.partialRecord(z.enum(["a", "b"]), z.number());
type A = z.infer<typeof A>;

z.string("Bad!");
z.string().check(z.minLength(5, "Too short!"));
z.uuid("Bad UUID!");
z.iso.date("Bad date!");
z.array(z.string(), "Bad array!");
z.array(z.string()).check(z.minLength(5, "Too few items!"));
z.set(z.string(), "Bad set!");
z.array(z.string(), "Bad array!");
z.set(z.string(), "Bad set!");
z.array(z.string(), "Bad array!");
