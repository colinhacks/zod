import * as z from "zod";

export const UserModel = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
});

type UserModel = z.infer<typeof UserModel>;
