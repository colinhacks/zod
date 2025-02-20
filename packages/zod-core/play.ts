import * as z from "@zod/core";
import * as util from "@zod/core/util";

/* Standard Form:
 *
 * ```
 * const schema = z.union([z.string(), z.number(), z.boolean()]);
 * const data = "John";
 * const result = z.safeParse(schema, data);
 * console.log(JSON.stringify(result, null, 2));
 * ```
 */
const schema = z.discriminatedUnion([
  z.object({
    type: z._default(z.literal("foo"), "foo"),
    a: z.string(),
  }),
  z.object({
    type: z.literal("custom"),
    method: z.string(),
  }),
  // z.object({
  //   type: z.preprocess((val) => String(val), z.literal("bar")),
  //   c: z.string(),
  // }),
]);

const data = { type: "foo", a: "foo" };
const result = z.safeParse(schema, data);
console.log(JSON.stringify(result, null, 2));

util.objectValues;
