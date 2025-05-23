import * as z from "zod/v4";

z;

const result = z.toJSONSchema(z.date(), {
  unrepresentable: "any",
  override: (ctx) => {
    const def = ctx.zodSchema._zod.def;
    if (def.type === "date") {
      ctx.jsonSchema.type = "string";
      ctx.jsonSchema.format = "date-time";
    }
  },
});
/* => {
  type: 'string',
  format: 'date-time',
  '$schema': 'https://json-schema.org/draft/2020-12/schema'
} */
console.dir(result, { depth: null });
