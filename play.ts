import { z } from "zod/v4";

const schemas = [z.number().int(), z.int(), z.int().positive(), z.int().nonnegative(), z.int().gt(0), z.int().gte(0)];

for (const schema of schemas) {
  console.log(`Accepts ${Number.MAX_SAFE_INTEGER}`, schema.safeParse(Number.MAX_SAFE_INTEGER).success ? "YES" : "NO");
  console.log("JSON Schema", z.toJSONSchema(schema));
}

const myEnum = z.enum(["left", "right", "center", "justify"]);
const myObject = z.object({ myEnum: myEnum });

type MyObject = z.infer<typeof myObject>;
type MyObjectInput = z.input<typeof myObject>;
