import * as z from "zod";

z;

const schema = z.strictInterface({
  username: z.string(),
  favoriteNumbers: z.array(z.number()),
});
const result = schema.safeParse({
  username: 1234,
  favoriteNumbers: [1234, "4567"],
  extraKey: "extraValue",
});
console.log(result.error!.issues);

console.dir(z.treeifyError(result.error!), { depth: null });
console.log(z.prettifyError(result.error!));
console.dir(z.flattenError(result.error!), { depth: null });
console.dir(z.formatError(result.error!), { depth: null });
