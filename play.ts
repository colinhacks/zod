import * as z from "zod";
const name = z.object({ first: z.string(), last: z.string() }).meta({ id: "name" });
const result = z.toJSONSchema(
  z.object({
    name: name,
    alt: name.readonly(),
    age: z.number().meta({ id: "age" }),
  })
);
console.dir(result, { depth: null });

// z.email().length(5, 10).meta({ id: "email" });
