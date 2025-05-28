import { z } from "zod/v3";

// import * as z from "zod";

const parseResult = z
  .string()
  .refine((x) => false) // force anything/everything to fail
  .transform((x) => {
    console.log("I don't get called"); // correct
    return x.length;
  })
  .refine((x) => {
    console.log("I shouldn't get called!!!!!!");
    console.log(typeof x); // number
    console.log(x);
  })
  .safeParse("123");

console.log(`succeeded:  ${parseResult.success}`); // false (correct behavior)

// z.string().min(1234, { abort: true });
