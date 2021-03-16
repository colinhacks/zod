import { z } from ".";

const run = async () => {
  z;
  const schema = z
    .object({
      inner: z.object({
        name: z
          .string()
          .refine((val) => val.length > 5)
          .array()
          .refine((val) => val.length > 5),
      }),
      password: z.string().refine((val) => val === val.toUpperCase()),
      confirm: z.string(),
    })
    .refine(
      (val) => {
        console.log(`FORM DATA`);
        console.log(JSON.stringify(val, null, 2));
        return val.confirm === val.password;
      },
      { path: ["confirm"] }
    );
  const result = schema.safeParse({
    inner: { name: ["aasd", "asdfasdfasfd", "aasd"] },
    password: "peanuts",
    confirm: "peanuts",
  });
  console.log(result);
};

run();

export {};
