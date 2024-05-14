import { z } from "./src/index";

z;

const schema = z
  .string()
  .transform((val) => val.length)
  .refine(() => false, { message: "always fails" })
  .refine(
    (val) => {
      if (typeof val !== "number") throw new Error();
      console.log(`val`, val, typeof val);
      return (val ^ 2) > 10;
    } // should be number but it's a string
  );
schema.parse("hello");
