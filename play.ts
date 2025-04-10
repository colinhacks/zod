import * as z from "zod";

z;

// interface MyStringSchema extends z.$ZodString {}
// class MyStringSchema {
//   constructor() {
//     z.$ZodString.init(this, {
//       type: "string",
//     });
//   }

//   handle(value: string) {
//     const result = this._zod.parse({ issues: [], value }, {});
//     if (result instanceof Promise) {
//       throw new Error("Promise not supported");
//     }
//     result.issues;
//   }
// }

// const myStringSchema = new MyStringSchema();
// const result = myStringSchema.handle("hello");
// console.log(result);

const personToExtend = z.object({
  firstName: z.string(),
  lastName: z.string(),
});
const PersonWithNickname = personToExtend.extend({ nickName: z.string() });
PersonWithNickname._zod.output;
