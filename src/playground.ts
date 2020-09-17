<<<<<<< HEAD
import * as z from "./"

const os = z.optional(z.string());

console.log(os)
console.log(os.safeParse(1))
console.log(os.safeParse({}))
console.log(os.safeParse(undefined))

const oo = z.object({
    s: z.string().optional()
})
//type _ts = z.infer<typeof os> 
console.log(oo)
console.log(oo.safeParse(1))
console.log(oo.safeParse({}))
console.log(oo.safeParse(undefined))


 
 
 
=======
import * as z from '.';

const userUpdateSchema = z.object({
  password: z
    .string()
    .min(6)
    .optional(),
});

console.log(userUpdateSchema.parse({}));
>>>>>>> master
