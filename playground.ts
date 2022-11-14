import { z, ZodFormattedError } from "./src";

// const type = z.intersection(
//   z.object({ a: z.null() }),
//   z.record(
//     z.string().refine((s): s is "b" => s === "b"),
//     z.undefined()
//   )
// );

// type type = z.infer<typeof type>;
// const input: type = { a: null, b: undefined };
// const result = type.parse(input);
// console.log(result);

// type myType = Partial<Record<"a", undefined>>;
// const myData: myType = { b: "" };
// Type '{ b: string; }' is not assignable to type 'Partial<Record<"a", undefined>>'.
// Object literal may only specify known properties, and 'b' does not exist in type 'Partial<Record<"a", undefined>>'.ts

// const myEnum = z.enum(["a", "b"]);
// const myRecord = z.record(myEnum, z.string());
// console.log(myRecord.parse({ c: "asfd" }));

// const result = z
//   .string()
//   .transform((x) => x.length)
//   .pipe(z.number())
//   .parse("asdf");
// console.log(result);

async function main() {
  const schema = z.string().catch("1234");

  const result = await schema.parse(1234);
  console.log(result);
}
main();
