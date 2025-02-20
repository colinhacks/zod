// import type { GlobalMeta } from "@zod/core";
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

const errorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type") {
    if (issue.expected === "string") {
      return { message: "bad type!" };
    }
  }
  if (issue.code === "custom") {
    return { message: `less-than-${issue.minimum}` };
  }
  return undefined;
};

const schema = z.string().refine((val) => val.length > 12, {
  params: { minimum: 13 },
  message: "override",
  error: (iss) => (iss.input === undefined ? "asdf" : null),
});
const data = "asdf";
const result = schema.safeParse(data, { error: errorMap });
console.log(JSON.stringify(result, null, 2));
