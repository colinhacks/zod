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

const schema = z.object({ asdf: z.string().default("hi") });
schema.safeParse({});
schema.register(z.globalRegistry, {});
