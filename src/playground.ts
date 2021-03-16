import { z } from ".";

const run = async () => {
  const errorMap: z.ZodErrorMap = (error, ctx) => {
    if (error.code === z.ZodIssueCode.invalid_type) {
      if (error.expected === "string") {
        return { message: "bad type!" };
      }
    }
    if (error.code === z.ZodIssueCode.custom) {
      return { message: `less-than-${(error.params || {}).minimum}` };
    }
    return { message: ctx.defaultError };
  };
  errorMap;
  console.log(z.string().safeParse(1234));
};

run();

export {};
