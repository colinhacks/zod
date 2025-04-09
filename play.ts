import * as z from "@zod/core";

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

const check = {} as z.$ZodChecks;
const def = check._zod.def;

switch (def.check) {
  case "less_than":
  case "greater_than":
  // ...
  case "string_format":
    {
      const formatCheck = check as z.$ZodStringFormatChecks;
      const formatCheckDef = formatCheck._zod.def;

      switch (formatCheckDef.format) {
        case "email":
          // ...
          break;
        case "url":
          // ...
          break;
        // etc
      }
    }
    break;
}
