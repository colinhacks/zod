import * as z from "@zod/core";

/* Standard Form:
 *
 * ```
 * const schema = z.union([z.string(), z.number(), z.boolean()]);
 * const data = "John";
 * const result = z.safeParse(schema, data);
 * console.log(JSON.stringify(result, null, 2));
 * ```
 */
const userSchema = z.interface({
  name: z.string(),
  age: z.number(),
  "email?": z.string(),
});

console.log(userSchema._def.optional);
const partialSchema = z.partial(userSchema, { age: true });
console.log(partialSchema._def.optional);
const data = { age: 234 };
const result = z.safeParse(partialSchema, data);
console.log(JSON.stringify(result, null, 2));
