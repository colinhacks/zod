import * as z from "zod";
<<<<<<< HEAD
z;
=======
z.config(z.locales.en());

/** Standard Form:
 *
 * ```
 * const schema = z.interface({ a: z.string(), "b?": z.string() });
 *
 * const data = { a: "Hello" };
 * const result = schema.safeParse(data);
 * console.dir(result, {depth: null});
 * ```
 */
const a = z.json();
type a = z.output<typeof a>;
// z.parse(a, "hello");
>>>>>>> 2b18cea5 (Refactor object-like internals. use optionality in zodinterface shape. remove ?-prefixing for defaulted. handle optionals/defaults in json schema)
