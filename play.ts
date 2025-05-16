import { z } from "zod/v4";

const schema = z
  .string()
  .meta({ examples: ["test"] })
  .transform(Number)
  // .pipe(z.transform(Number).meta({ examples: [4] }))
  .meta({ examples: [4] });

console.dir(z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }), { depth: null });
