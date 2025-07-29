import * as z from "zod/mini";
// import * as z3 from "zod/v3";
import * as zm from "zod/mini";

const schema1 = zm
  .object({
    addressLine1: zm.string(),
    addressLine2: zm.string().check(
      z.superRefine((val, ctx) => {
        if (ctx.value === "hello2") {
          ctx.addIssue({
            code: "custom",
            input: ctx.value,
            message: "hellotwo",
          });
        }
      })
    ),
  })
  .check((ctx) => {
    const { addressLine1 } = ctx.value;
    if (addressLine1 === "hello1") {
      ctx.issues.push({
        code: "custom",
        input: addressLine1,
        path: ["addressLine1"],
        message: "hello1",
      });
    }
  });

const data = {
  addressLine1: "hello1",
  addressLine2: "hello2",
};

console.log("schema1 - zod mini", schema1.safeParse(data).error?.issues);
