import { z } from "zod/v4";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      console.log("pass check", data);
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

console.log(
  schema.safeParse({
    password: "asdf",
    confirmPassword: "asdff",
  })
);
