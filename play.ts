import { z } from "zod/v4";

const schema = z.object({
  username: z.string(),
  coworkers: z.array(
    z.object({
      name: z.string(),
      children: z.array(
        z.object({
          name: z.string(),
        })
      ),
    })
  ),
});

const data = {
  username: "John",
  coworkers: [
    { name: "Dave", children: [{ name: "Luke" }] },
    { name: "Amy", children: [{ name: "Ana" }, { name: 3 }] },
  ],
};

const result = schema.safeParse(data);
console.dir(z.formatError(result.error!), { depth: null }); // false

z.treeifyError(result.error!).properties?.username?.errors; // true
