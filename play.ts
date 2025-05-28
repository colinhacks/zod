import { z } from "zod/v4-mini";

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
//         // continue: false,
//         // fa
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

// console.log("NESTED");
// console.log(obj.safeParse({ test: undefined }, { jitless: true })); // check runs, doesn't throw, transform not run

// console.log("\n\nTOP LEVEL");
// console.log(zval.safeParse(undefined, { jitless: true })); // check runs, throws

const Shared = z.object({
  label: z.string(),
  description: z.string(),
});

const DU = z.discriminatedUnion("type", [
  z.extend(Shared, { type: z.literal("a"), value: z.number() }),
  z.extend(Shared, { type: z.literal("b"), value: z.string() }),
  z.extend(Shared, { type: z.literal("c"), value: z.boolean() }),
]);
