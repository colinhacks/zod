import * as z from '.';

const userUpdateSchema = z.object({
  password: z
    .string()
    .min(6)
    .optional(),
});

console.log(userUpdateSchema.parse({}));

const a = z.number().optional();
console.log(a.safeParse('1234'));
