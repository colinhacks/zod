import * as z from "zod";

const myFunction = z.function({
  input: [
    z.object({
      name: z.string(),
      age: z.number().int(),
    }),
  ],
  output: z.string(),
});

const fn = myFunction.implement((input) => {
  input;
  return `Hello ${input.name}, you are ${input.age} years old.`;
});

console.log(
  fn({
    name: "John",
    age: 30,
  })
);
