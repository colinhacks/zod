import { z } from "zod/v4";

const myReg = z.registry<{
  defaulter: (arg: z.$input) => z.$output;
}>();

const mySchema = z.string().transform((val) => val.length);
myReg.add(mySchema, {
  defaulter: (arg) => {
    return arg.length;
  },
});

myReg.get(mySchema)?.defaulter("hello"); // 5
