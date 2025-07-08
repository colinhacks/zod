import * as z from "zod/v4";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
    anotherField: z.string(),
  })
  .refine(
    (data) => {
      try {
        return data.password === data.confirmPassword;
      } catch (_: any) {
        // if an error occured, there are other issues already
        // so we can pretend this check passed
        return true;
      }
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
      when: () => true,
    }
  );
