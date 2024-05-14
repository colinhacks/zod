import { z } from "./src/index";

z;

const schema = z.object({
  inner: z.object({
    name: z
      .string()
      .refine((val) => val.length > 5, {
        message: "name should be greater than 5",
      })
      .array()
      // .transform((val) => val.length)
      .refine(
        (val) => {
          console.log(`val`, val);
          return val.length <= 1;
        },
        {
          message: "name list should be less <=1 item long",
        }
      ),
  }),
});
const invalidItem = {
  inner: { name: ["aasd", "asdfasdfasfd"] },
};

console.log(
  z
    .string()
    .transform((val) => val.length)
    .refine(() => false, { message: "always fails" })
    .refine(
      (val) => {
        console.log(`val`, val, typeof val);
        return (val ^ 2) > 10;
      } // should be number but it's a string
    )
    .parse("hello")
);

// const result1 = schema.safeParse(invalidItem);

// console.log(result1);

// class Arg<T = any> {
//   protected _protected: T;
//   _public: number;
//   parse(): T {
//     return {} as T;
//   }
// }

// declare const arg: Arg;

// type infer<T extends Arg> = ReturnType<T["parse"]>;
