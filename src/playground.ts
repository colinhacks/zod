import { z } from ".";

const run = async () => {
  z;
  const schema = z.object({
    inner: z.object({
      name: z
        .string()
        .refine((val) => val.length > 5)
        .array()
        .refine((val) => val.length <= 1),
    }),
  });

  const invalidItem = {
    inner: { name: ["aasd", "asdfasdfasfd"] },
  };
  const invalidArray = {
    inner: { name: ["asdfasdf", "asdfasdfasfd"] },
  };
  const result1 = schema.safeParse(invalidItem);
  result1;
  const result2 = schema.safeParse(invalidArray);
  if (!result2.success) console.log(result2.error?.format());
};

run();

export {};
