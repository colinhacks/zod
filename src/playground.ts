import { string, z } from "./index";

const run = async () => {
  z;
  const arg = z
    .object({ name: string() })
    .refine((val) => val.name.length > 10)
    .and(z.object({ test: z.number() }));

  console.log(
    arg.safeParse({
      name: "aasdfsdffssdf",
      test: 1234,
    })
  );
};

run();

export {};
