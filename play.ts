import { z } from "zod/v4";

// const schema = z
//   .union([z.string().date(), z.string().datetime(), z.string().datetime({ local: true })])
//   .meta({ a: true })
//   .transform((str) => new Date(str))
//   .meta({ b: true })
//   .pipe(z.date())
//   .meta({ c: true })
//   .brand("dateIn");

// // const schema = z.string().default("asdf").catch("qwer");

// z.toJSONSchema(schema, {
//   unrepresentable: "any",
//   io: "input",
//   override(ctx) {
//     console.log();
//     console.dir("override!!", { depth: null });
//     console.dir(ctx.zodSchema._zod.def.type, { depth: null });
//     console.dir(ctx.jsonSchema, { depth: null });
//   },
// });

const a = z
  .string()
  .transform((val) => val.length)
  .pipe(z.number());
const b = a.prefault("hello");
const c = a.default(1234);

a;
console.dir(z.toJSONSchema(a), { depth: null });
console.dir(z.toJSONSchema(a, { io: "input" }), { depth: null });

// b
console.dir(z.toJSONSchema(b), { depth: null });
console.dir(z.toJSONSchema(b, { io: "input" }), { depth: null });

// c
console.dir(z.toJSONSchema(c), { depth: null });
console.dir(z.toJSONSchema(c, { io: "input" }), { depth: null });
