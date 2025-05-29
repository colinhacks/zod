import { z } from "zod/v4";

// export type ClickCallbackArgs = z.infer<typeof ClickCallbackArgsSchema>;

const myFunction = z.function({
  input: [
    z.object({
      name: z.string(),
      age: z.number().int(),
    }),
  ],
  output: z.string(),
});

myFunction.implement((args) => {
  return `${args.age}`;
});
