import * as z from '.';

export const CreateUserParams = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
export type CreateUserParams = z.infer<typeof CreateUserParams>;
