import { z } from "./index.ts";

const run = async () => {
  z;

  const Strings = z.array(z.string()).superRefine((val, ctx) => {
    if (val.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 3,
        type: "array",
        inclusive: true,
        message: "Too many items 😡",
      });
    }

    if (val.length !== new Set(val).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `No duplicated allowed.`,
      });
    }
  });
};
run();

export {};
