import * as z from "./src/index";

// try {
//   z.string().superRefine((val, ctx) => {
//     ctx.addIssue({
//       code: 'invalid_type',
//       received: 'undefined',
//       expected: 'string',
//     })
//     return z.NEVER;
//   }).parse('a22222')
//   // S
// } catch (err) {
//   console.log('err', err.formErrors.fieldErrors, err.formErrors);
// }

// process.exit()

const schema = z.object({
  name: z.string({
    label: 'Name Label'
  }).superRefine(async (val, ctx) => {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // ctx.addIssue({
    //   code: z.ZodIssueCode.custom,
    //   message: `Custom message "${ctx.label}" issue`,
    //   fatal: true
    // })

    // return z.NEVER;
  }),
  lastName: z.string({
    label: 'Last Name Label',
  }),
  email: z.string().email(),
  age: z.number().min(18).max(19),
  address: z.string(),
  option: z.array(z.enum(['a'], { label: 'Option label' })),
  optional: z.string({ label: 'optional label (inherit)' }).optional().superRefine((val, ctx) => {
    if(val){
      ctx.addIssue({
        code: 'invalid_type',
        received: 'undefined',
        expected: 'string',
      })
      return z.NEVER;
    }
  }),
}).important({
  email: true
});

try {
  const result = await schema.parseAsync(
    { name: "John", email: 'test@test.te', age: 20, option: ['b'], optional: 'ha' }
    // { name: "John", email: 'test', age: 20, option: ['a'] }
  , {
    fatalOnError: true,
  });
  console.log('res', result)
} catch (err) {
  if(err instanceof z.ZodError)
    console.log(err.formErrors.fieldErrors);
}
