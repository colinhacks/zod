import * as z from '.';

const run = async () => {
  const userUpdateSchema = z.object({
    password: z
      .string()
      .min(6)
      .optional(),
  });

  userUpdateSchema.parse({ password: '123456' }); // OK
  userUpdateSchema.parse({}); // OK

  // const f1 = z
  //   .function()
  //   .args(z.string())
  //   .returns(z.unknown())
  // .implement(async val => {
  //   return { asdf: val };
  // })
  // type f1 = z.infer<typeof f1>;
};

run();
