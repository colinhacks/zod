import * as z from "zod";

z;

z.superRefine((val, ctx) => {
  ctx.addIssue({
    code: "custom",
    message: "Custom message",
  });
});
