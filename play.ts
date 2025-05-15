import { z } from "zod/v4";

z.config({
  jitless: true,
});

const A = z.object({
  a: z.string(),
});

console.log(
  A.parse({
    a: "hello",
  })
);
