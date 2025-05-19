import * as z from "zod/v4";

const MyFunction = z.function({
  input: [z.string()],
  // output: z.number(),
});

const computeLength = MyFunction.implement((name) => name.length);
