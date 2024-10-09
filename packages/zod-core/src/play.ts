import * as z from "./index.js";

const str = z
  .string({
    checks: [],
    coerce: false,
    type: "string",
  })
  ._refine(z.startsWith("asdf"));
// console.log(str._parse("asdfasdf"));
// console.log(str._parse("qwerqwer"));

const num = z
  .number({
    // checks: [],
    coerce: false,
    // type: "number",
  })(z.gte(0))
  ._refine(z.lte(10));
// console.log(num);
console.log(num._parse(-10));
console.log(num._parse(20));
console.log(num._parse(5));

// const schema = z._union({
//   type: "union",
//   checks: [],
//   elements: [str, num],
// });
// console.log(schema._parse(1234));
// console.log(schema._parse("1234"));

// const obj = z._object({
//   type: "object",
//   checks: [],
//   properties: {
//     str: str,
//     num: num,
//   },
// });
// console.log(obj._parse({ str: "asdf", num: 1234 }));

// const discunion = z._discriminatedUnion({
//   type: "union",
//   checks: [],
//   elements: [obj, obj],
// });
// console.log(
//   discunion._parse({
//     str: "asdf",
//     num: 1234,
//   })
// );

// interface _String {
//   __string: true;
// }

// const _String: {
//   prototype: _String;
//   [Symbol.hasInstance](inst: any): boolean;
//   // new (): _String;
//   // (): _String;
// } = function _String() {
//   return {
//     __string: true,
//   };
// };
// function _string(): _String {
//   return { __string: true };
// }
// const s1 = _string();
// s1.__string;

// const s2: any = {};
// Object.defineProperty(_String, Symbol.hasInstance, {
//   value: (inst: any) => inst?.__string === true,
// });
// if (s2 instanceof _String) {
//   s2;
// }

// console.log(s1 instanceof _String);
// const rec = z._record({ "~values": new Set(["a", "b", "c"]) }, str);
// console.log(rec);
// console.log(
//   rec._parse({
//     num_a: "1243",
//     num_b: "1243",
//     num_c: "14",
//   })
// );
// export {};

// class Sub extends Super {
//   cache = createCache(this);

//   constructor(id: string) {
//     super(id);
//     console.log("constructor");
//     console.log(`id: ${this.id}`);
//   }

//   // cache2 = createCache(this.id);
// }

// new MyClass({ id: "1234" });
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
