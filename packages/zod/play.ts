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

const schema = z.object({
  people: z.array(z.string()).min(2),
});

const result = schema.safeParse({
  people: [123],
});
console.log(JSON.stringify(result, null, 2));

z.object;
