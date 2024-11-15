import * as z from "./src/index.js";

// test stirng
console.log(z.parse(z.string(), "hello"));

// test object
console.log(
  z.parse(
    z.object({
      a: z.string(),
      b: z.string(),
      c: z.string(),
    }),
    {
      a: "hello",
      b: "123",
      c: "true",
    }
  )
);

// test array
console.log(z.parse(z.array(z.string()), ["data"]));

// console.log(z.parse2(schema, data));
// console.log(z.parse3(schema, data));

// const a = z.templateLiteral([z.string(), z.number()]);
// type a = z.output<typeof a>;
// console.log(z.safeParse(a, "hello123"));
// console.log(z.safeParse(a, 123));
// console.log(z.safeParse(a, "hello"));

// // multipart
// const b = z.templateLiteral([z.string(), z.number(), z.string()]);
// type b = z.output<typeof b>;
// console.log(z.safeParse(b, "hello123world"));
// console.log(z.safeParse(b, "123"));
// console.log(z.safeParse(b, "hello"));

// // include boolean
// const c = z.templateLiteral([z.string(), z.boolean()]);
// type c = z.output<typeof c>;
// console.log(z.safeParse(c, "hellotrue"));
// console.log(z.safeParse(c, "hellofalse"));
// console.log(z.safeParse(c, "hello"));

// // include literal prefix
// const d = z.templateLiteral([z.literal("hello"), z.number()]);
// console.log(z.number()._pattern.test("1234"));

// export const numberRegex: RegExp = /-?\d+(?:\.\d+)?(?:e-?\d+)?/i;
// console.log(numberRegex.test("1234"));
// type d = z.output<typeof d>;
// console.log(z.safeParse(d, "hello123"));
// console.log(z.safeParse(d, "123"));
// console.log(z.safeParse(d, "world123"));

// // include literal union
// const e = z.templateLiteral([z.literal(["aa", "bb"]), z.number()]);
// type e = z.output<typeof e>;
// console.log(z.safeParse(e, "aa123"));
// console.log(z.safeParse(e, "bb123"));
// console.log(z.safeParse(e, "cc123"));
