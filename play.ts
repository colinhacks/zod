import * as z from "zod/v4";

z;

function foo<T extends z.ZodType>(subSchema: T) {
  fetch("example/api")
    .then((res) => res.json())
    .then((json) => {
      const resSchema = makeSchema(subSchema);

      const parsed = resSchema.safeParse(json);

      if (parsed.success) {
        if (parsed.data.passed) {
          console.log(parsed.data.value);
        }
      }
    });
}

function makeSchema<const T extends z.ZodType>(subSchema: T) {
  const resSchema = z.union([
    z.object({
      passed: z.literal(true),
      value: subSchema,
    }),
    z.object({
      passed: z.literal(false),
      msg: z.string(),
    }),
  ]);

  return resSchema;
}

const schema = makeSchema(z.number());

const result = schema.parse({ passed: true, value: 1 });
if (result.passed) {
  result.value;
} else {
  result.msg;
}
