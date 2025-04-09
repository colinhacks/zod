import * as z from "@zod/mini";

z;

// const schema = z.strictInterface({
//   username: z.string(),
//   favoriteNumbers: z.array(z.number()),
// });
// const result = schema.safeParse({
//   username: 1234,
//   favoriteNumbers: [1234, "4567"],
//   extraKey: "extraValue",
// });
// console.log(result.error!.issues);

// console.dir(z.treeifyError(result.error!), { depth: null });
// console.log(z.prettifyError(result.error!));
// console.dir(z.flattenError(result.error!), { depth: null });
// console.dir(z.formatError(result.error!), { depth: null });

// z.optional(z.string());
// z.union([z.string(), z.number()]);
// z.string().check(z.refine((val) => val.includes("@")));
// z.array(z.number()).check(z.minLength(5), z.maxLength(10));
// z.extend(z.object({ name: z.string() }), { age: z.number() });

// const schema = z.coerce.string();
// type schemaInput = z.input<typeof schema>;
// type schemaOutput = z.output<typeof schema>;
