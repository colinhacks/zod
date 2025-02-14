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

// const schemaNoBreak = z
//   .string()
//   .default("asdf")
//   .overwrite((val) => val.toUpperCase());
// console.log(schemaNoBreak.safeParse(undefined));

// const schemaWithBreak = z
//   .string()
//   .overwrite((val) => val.toUpperCase())
//   .default("asdf");
// console.log(schemaWithBreak.safeParse(undefined));

const p = z
  .union([z.literal("").transform(() => undefined), z.string().optional()])
  .optional()
  .default("test");

console.log(p.safeParse(""));
