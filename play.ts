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
const result = baseSchema.safeParse(undefined);

console.log(result.error);
