import * as z from "zod";

const baseSchema = z
  .string()
  .optional()
  .check(({ value, ...ctx }) => {
    ctx.issues.push({
      code: "custom",
      input: value,
      message: "message",
    });
  });

// this correctly fails
console.log(baseSchema.safeParse(undefined));

const schemaObject = z.object({
  date: baseSchema,
});

console.log(schemaObject.safeParse({ date: undefined }));
