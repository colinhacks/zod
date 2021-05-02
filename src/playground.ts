import { z } from "./index";

const run = async () => {
  z;

  const schema = z.string().refine((val: string) => val.length > 5);

  schema.parse("abc", {
    errorMap: () => ({ message: "custom error message" }),
  });

  type B = {
    name: string | null;
    child: B | null;
  };

  const bSchema: z.ZodSchema<B, any, any> = z.lazy(() =>
    z.object({
      name: z.string().nullable().default(null),
      child: bSchema.nullable(),
    })
  );
};

run();

export {};
