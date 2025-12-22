import * as z from "zod";

z.string().brand<"A", "in">();
z.string().brand<"A", "out">();
z.string().brand<"A", "inout">();

const baseSchema = z.object({
  value: z.number(),
  allowsNegative: z.boolean(),
  somethingElse: z.string(),
});

const refinement = z.refine<{ value: number; allowsNegative: boolean }>(({ value, allowsNegative }) => {
  if (allowsNegative) {
    return true;
  }
  return value >= 0;
});

const schema = baseSchema.check(refinement);

const schemaB = baseSchema
  .safeOmit({
    somethingElse: true,
  })
  .check(refinement);
