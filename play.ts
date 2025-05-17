import { z } from "zod/v4";

let overrideCount = 0;
const schema = z
  .union([z.string().date(), z.string().datetime(), z.string().datetime({ local: true })])
  .meta({ a: true })
  .transform((str) => new Date(str))
  .meta({ b: true })
  .pipe(z.date())
  .meta({ c: true })
  .brand("dateIn");
z.toJSONSchema(schema, {
  unrepresentable: "any",
  io: "input",
  override(_) {
    console.dir(_.zodSchema._zod.def.type, { depth: null });
    overrideCount++;
  },
});
