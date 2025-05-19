import * as z from "zod/v4";

const data = z
  .object({
    foo: z.boolean().nullable().default(true),
    bar: z.boolean().default(true),
  })
  .parse({ foo: null }, { jitless: false });

console.dir(data, { depth: null });

function inferSchema<T>(schema: z.core.$ZodType<string>) {
  return schema;
}

inferSchema(z.string()); // ✅
inferSchema(z.number()); // ❌ Inferred type is not assignable to parameter of type 'string'
