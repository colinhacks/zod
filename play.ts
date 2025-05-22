import * as z from "zod/v4";

z.custom<Date>((val) => val instanceof Date);

z.string().min(5, {
  error: (iss) => {
    // customize "too_small" error message
    if (iss.code === "too_small") {
      return `Password must have ${iss.minimum} characters or more`;
    }

    // use default error otherwise
    return undefined;
  },
});

z.ZodError;

const arg = z.custom<Date>((val) => val instanceof Date);
z.date().check(z.custom((val) => val.getTime() > 0));

// z.tuple<[title: string, text: string]>([z.string(), z.string()]);
