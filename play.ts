import * as z from "zod/v4";

z;

const a = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("a"),
    })
    .meta({ id: "foo" }),
]);

z.toJSONSchema(a, {
  override(ctx) {
    console.dir(ctx.jsonSchema, { depth: null });
  },
});
