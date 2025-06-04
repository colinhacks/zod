import * as z from "zod/v4";

const schema = z.string().meta({
  whatever: 1234,
});

console.dir(z.toJSONSchema(schema), { depth: null });
