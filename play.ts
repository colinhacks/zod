import { z } from "zod/mini";

const myPartialRecord = z.partialRecord(z.enum(["a", "b", "c"]), z.string());

// console.log(myPartialRecord._zod.output);

console.log(
  myPartialRecord.parse({
    a: "123",
  })
);

console.log(
  myPartialRecord.parse({
    b: "123",
  })
);
// console.log(myPartialRecord.keyType.enum);
// // undefined
// console.log(myPartialRecord.keyType.options);
// // [ ZodEnum, ZodNever ]
