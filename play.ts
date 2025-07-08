import { z } from "zod/v4";

// const schema = z
//   .object({
//     password: z.string().min(8),
//     confirmPassword: z.string(),
//     anotherField: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//     when(payload) {
//       if (payload.value === undefined) return false;
//       if (payload.value === null) return false;
//       // no issues with confirmPassword or password
//       return payload.issues.every((iss) => iss.path?.[0] !== "confirmPassword" && iss.path?.[0] !== "password");
//     },
//   });

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
    anotherField: z.string(),
  })
  .check(
    // z.refine((data) => data.password === data.confirmPassword, {
    //   message: "Passwords do not match",
    //   path: ["confirmPassword"],
    //   when(payload) {
    //     if (payload.value === undefined) return false;
    //     if (payload.value === null) return false;
    //     // no issues with confirmPassword or password
    //     return payload.issues.every((iss) => iss.path?.[0] !== "confirmPassword" && iss.path?.[0] !== "password");
    //   },
    // })
    z.check((ctx) => {
      if (ctx.value.password === ctx.value.confirmPassword) {
        ctx.issues.push({
          code: "custom",
          message: "Passwords do not match",
          input: ctx.value,
        });
      }
    })
  );

schema.parse({
  password: "asdf",
  confirmPassword: "asdf",
  anotherField: 1234, // ❌ error
});

z.string().check((ctx) => {
  if (ctx.value === "asdf") {
    ctx.issues.push({
      code: "custom",
      message: "No asdf allowed",
      input: ctx.value,
    });
  }
});
schema.parse(null);

z.string().refine;
