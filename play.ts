import * as z from "./packages/zod-core/src/index.js";

const schema = z.interface({
  name: z.string(),
});

z.parse(schema, { name: "John" });
const result = z.parse(schema, { name: "John" });
console.log(result);
