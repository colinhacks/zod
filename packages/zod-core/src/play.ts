import * as z from "./index.js";

const str = new z.$ZodString({
  checks: [],
  coerce: false,
});
const num = new z.$ZodNumber({
  checks: [],
  coerce: false,
});
console.log(num._parse(1234));
const schema = new z.$ZodUnion({
  checks: [],
  elements: [str, num],
});
console.log(schema._parse(1234));
const obj = new z.$ZodObject({
  checks: [],
  properties: {
    str: str,
    num: num,
  },
});
console.log(obj._parse({ str: "asdf", num: 1234 }));
const discunion = new z.$ZodDiscriminatedUnion({
  checks: [],
  elements: [obj, obj],
});
console.log(
  discunion._parse({
    str: "asdf",
    num: 1234,
  })
);

// const stringWithUUIDSchema = z.string([z.uuid()]);
// console.log(stringWithUUIDSchema.checks);
// const uuidSchema = z.uuid();
// console.log(uuidSchema);
// console.log(stringWithUUIDSchema._parse("testing"));
// console.log(uuidSchema._parse("testing"));

// uuidSchema;
// console.log(z.number()._parse(1234));
// console.log(z.number()._parse("1234"));
// z.string({ message: (issue) => issue.code }).uuid({ message: "Not a uuid. " });

// uuidSchema["~output"];

// console.log(z.string().parse("asdf"));
// const str = new z.ZodString({
//   checks: [],
//   coerce: false,
// });
// type lakdsf = z.ZodString;
// console.log(str.parse("adsf"));
// // console.log(str.__proto__);
// // console.log(z.ZodType.prototype);
// // console.log(z.ZodString.prototype);
// // console.log(Object.getOwnPropertyDescriptors(z.ZodString.prototype));
// // console.log(Object.getOwnPropertyDescriptors(z.$ZodString.prototype));
// // console.log(Object.getOwnPropertyDescriptors(z.ZodType.prototype));
// Object.defineProperties(
//   z.ZodString.prototype,
//   Object.getOwnPropertyDescriptors(z.ZodType.prototype)
// );
// // console.log(Object.getOwnPropertyDescriptors(z.ZodString.prototype));
// console.log(str.optional().__optional.parse("asdf"));

// console.log(str instanceof z.$ZodString);
// console.log(str instanceof z.ZodType);
// console.log(str instanceof z.ZodString);
