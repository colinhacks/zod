import * as z from "./src/index";

const schema = z.object({
  name: z.string({
    label: 'Name Label',
  }).superRefine((val, ctx) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Custom message "${ctx.label}" issue`,
      fatal: true
    })

    return z.NEVER;
  }),
  lastName: z.string({
    label: 'Last Name Label',
  }),
  email: z.string().max(5).email(),
  age: z.number().min(18).max(19),
});

try {
  const result = await schema.parseAsync({ name: "John", email: 'test', age: 20 }, {
    fatalOnError: true
  });
  console.log('res', result)
} catch (err) {
  if(err instanceof z.ZodError)
    console.log(err.formErrors.fieldErrors);
}
