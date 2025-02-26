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
const schema = z.interface({
  "name?": z.string(),
});
const data = { name: undefined };
const result = z.safeParse(schema, data);
console.log(JSON.stringify(result, null, 2));
