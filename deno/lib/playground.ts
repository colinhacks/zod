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
        message: `No duplicates allowed.`,
      });
    }
  });
  console.log(Strings.safeParse(["asfd", "qwer"]));

  // console.log(Strings.safeParse(["asfd", "asfd", "asfd", "asfd"]));
  // console.log(Strings.safeParse(["asfd", "asfd"]));
};
run();

export {};
