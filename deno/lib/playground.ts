import { z } from "./index.ts";

const run = async () => {
  z;

  const propertySchema = z.string();
  const schema = z
    .object({
      a: propertySchema,
      b: propertySchema,
    })
    .refine(
      (val) => {
        return val.a === val.b;
      },
      { message: "Must be equal" }
    );

  try {
    schema.parse({
      a: "asdf",
      b: "qwer",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      console.log(error.flatten((iss) => iss.code));
    }
  }
};
run();

export {};
