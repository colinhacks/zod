import * as z from "@zod/core";

z.string([z.minLength(3), z.maxLength(10), z.refine((val) => val.includes("treeshaking!"))]);

/* Standard Form:
 *
 * ```
 * const schema = z.union([z.string(), z.number(), z.boolean()]);
 * const data = "John";
 * const result = z.safeParse(schema, data);
 * console.log(JSON.stringify(result, null, 2));
 * ```
 */
const schema = z.string();
const data = 123;
const result = z.safeParse(schema, data);
console.log(JSON.stringify(result.error, null, 2));

z.string([z.minLength(3), z.maxLength(10), z.refine((val) => val.includes("treeshaking"))]);

z.refine;
