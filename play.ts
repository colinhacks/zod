import * as z from "zod/v4";

z;

const schema = z.union([z.string(), z.number()]);

z.toJSONSchema(schema, {
  override(ctx) {
    console.dir(ctx.zodSchema._zod.def.type, { depth: null });
    console.dir(ctx.jsonSchema, { depth: null });
  },
});
