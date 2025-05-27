import { z } from "zod/v4";

// const zval = z
//   .string()
//   .check((ctx) => {
//     console.log(`Checking value: ${ctx.value}`);
//     if (ctx.value !== "expected") {
//       ctx.issues.push({
//         message: `Value must be 'expected', got '${ctx.value}'`,
//         input: ctx.value,
//         code: "custom",
//         fatal: true,
//       });
//     }
//   })
//   .transform((val) => {
//     console.log(`Transforming value: ${val}`);
//     return val.toUpperCase();
//   })
//   .prefault("unexpected");

// const obj = z.object({
//   test: zval,
// });

// console.log(obj.parse({ test: undefined })); // check runs, doesn't throw, transform not run
// console.log(zval.parse(undefined)); // check runs, throws

try {
  const result = z.stringbool("Wrong!").parse("");
} catch (err) {
  console.log(err);
}
