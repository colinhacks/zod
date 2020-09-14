import * as z from '.';

const userUpdateSchema = z.object({
  password: z
    .string()
    .min(6)
    .optional(),
});

console.log(userUpdateSchema.parse({}));
