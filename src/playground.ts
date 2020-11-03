// import * as z from '.';

// const XmlJsonArray = <Key extends string, Schema extends z.ZodTypeAny>(
//   element: Key,
//   schema: Schema,
// ) => {
//   return z.object({}).setKey(element, z.union([schema, z.array(schema)]));
// };

// const test = XmlJsonArray('asdf', z.string());

// // both work
// test.parse({ asdf: 'hello' });
// test.parse({ asdf: ['hello'] });

// type test = z.infer<typeof test>;
