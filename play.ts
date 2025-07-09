import * as z from "zod";

z;

const schema = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

console.log(
  schema.safeParse({
    password: "asdf",
    confirm: "asdF",
  }).success
);

console.log(
  schema.safeParse({
    password: "asdf",
    confirm: "asdf",
  }).success
);
z.file().mime("image/png");
