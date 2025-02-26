// import type { GlobalMeta } from "@zod/core";
import * as z from "@zod/core";

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

const F = z.interface({
  name: z.string(),
  get "f?"() {
    return z.nullable(F);
  },
});
