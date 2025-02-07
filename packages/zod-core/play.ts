import * as z from "zod-core";

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

const schema = z.pipe(
  z.string(),
  z.transform((val) => val.length)
);
const data = "asdf";
const result = z.safeParseAsync(schema, data);
console.log(JSON.stringify(result, null, 2));
