import * as z from "zod";

const A = z
  .string()
  .transform((val, ctx) => {
    ctx.addIssue({
      code: "custom",
      message: `custom error`,
    });
    ctx.addIssue({
      code: "custom",
      message: `custom error`,
    });
    return val;
  })
  .pipe(z.number() as any);
console.log(A.safeParse("asdf"));
// export const JsonTransformer = z.string().transform((val, ctx) => {
//   try {
//     return JSON.parse(val);
//   } catch (error: unknown) {
//     ctx.addIssue({
//       code: "custom",
//       message: (error as { message?: string }).message,
//       input: val,
//     });
//     // ctx.issues.push({
//     //   code: "custom",
//     //   message: (error as { message?: string }).message,
//     //   input: val,
//     // });
//     return z.NEVER;
//   }
// });

// const result = await JsonTransformer.pipe(
//   z.object({
//     foo: z.string(),
//   })
// ).safeParseAsync("invalid");
// console.log("error:", result.error?.issues);

const schema = z.preprocess((data, ctx) => {
  ctx.addIssue({
    code: "custom",
    message: `custom error`,
  });
  ctx.issues.push({
    code: "custom",
    message: `custom error`,
    input: "asdf",
  });
  return data;
}, z.string());
const result = schema.safeParse(1234);
// console.log(result);
