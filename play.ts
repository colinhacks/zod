import { z } from "zod/v4";

z;

function inferSchema<T extends z.core.$ZodType>(data: unknown, schema: T) {
  return parseData(data, schema);
}

function parseData<T extends z.core.$ZodType>(data: unknown, schema: T): z.output<T> {
  return z.parse(schema, data);
}

const A = z.union([z.stringbool(), z.literal([null, undefined]).transform((v) => !!v)]);

console.dir(A.parse(undefined), { depth: null });
console.dir(A.parse(null), { depth: null });
console.dir(A.parse("true"), { depth: null });
console.dir(A.parse("false"), { depth: null });

z.stringbool({
  truthy: ["true", "1", "yes", "on", "y", "enabled"],
  falsy: ["false", "0", "no", "off", "n", "disabled"],
});
