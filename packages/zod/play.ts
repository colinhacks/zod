// import type { GlobalMeta } from "@zod/core";
import * as z from "zod";

z;

/* Standard Form:
 *
 * ```
 * const schema = z.union([z.string(), z.number(), z.boolean()]);
 * const data = "John";
 * const result = z.safeParse(schema, data);
 * console.log(JSON.stringify(result, null, 2));
 * ```
 */
// const schema = z.instanceof(Date).refine((d) => d.toString());
// const data = null;
// const result = schema.safeParse(data);
// console.log(JSON.stringify(result, null, 2));

const SNamedEntity = z.interface({
  id: z.string(),
  set: z.string().optional(),
  unset: z.string().optional(),
});

const result = await SNamedEntity.safeParse(
  {
    id: "asdf",
    set: undefined,
    unset: undefined,
  },
  {
    // skipFast: true,
  }
);

console.log(SNamedEntity._def.catchall);
console.log(result);
