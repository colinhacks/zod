import { z } from "zod/v4";

// const foo = z.preprocess((val, ctx) => {
//   if (!val) {
//     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bad" });
//     return z.NEVER;
//   }
//   return val;
// }, z.number());

// type foo = z.infer<typeof foo>;
// // util.assertEqual<foo, number>(true);
// const arg = foo.safeParse(undefined);
// console.dir(arg.error, { depth: null });

// const schema2 = z
//   .custom<number>((arg) => typeof arg === "number")
//   .transform((arg) => {
//     console.log(arg);
//     return arg + 1;
//   });

// console.dir(schema2.safeParse("hello").error!, { depth: null });
// const A = z
//   .string()
//   .refine((val) => false)
//   .min(4)
//   .transform((val) => val.length)
//   .pipe(z.number())
//   .refine((val) => false);
// console.dir(A.safeParse("asdfasdf").error!, { depth: null });

const A = z
  .custom<string>((val) => typeof val === "string")
  .refine((val) => {
    return val.length > 3;
  });
A.parse(123);
