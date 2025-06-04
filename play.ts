import { z } from "zod/v4";

z.ipv4()
  .transform((value) => {
    // Called when invalid value
    console.log("input:", value);

    return value;
  })
  .safeParse("invalid_value");

z.email()
  .transform((value) => {
    // Called when invalid value
    console.log("input:", value);

    return value;
  })
  .safeParse("invalid_value");

z.uuid()
  .transform((value) => {
    // Called when invalid value
    console.log("input:", value);

    return value;
  })
  .safeParse("invalid_value");

z.url()
  .transform((value) => {
    // Not called when invalid value
    console.log("input:", value);
    return value;
  })
  .safeParse("invalid_value");

z.number()
  .transform((value) => {
    // Not called when invalid value
    console.log("input:", value);

    return value;
  })
  .safeParse("invalid_value");

z.boolean()
  .transform((value) => {
    // Not called when invalid value
    console.log("input:", value);

    return value;
  })
  .safeParse("invalid_value");
