import * as z from "zod";

// I'd recommend using a union of literals in conjunction with Zod 4's metadata API: https://zod.dev/metadata

const foo = z.literal("foo").describe("The foo value");
const bar = z.literal("bar").describe("The bar value");
const baz = z.literal("baz").describe("The baz value");

const schema = z.union([foo, bar, baz]);

console.log(z.toJSONSchema(schema));
// {
//   '$schema': 'https://json-schema.org/draft/2020-12/schema',
//   anyOf: [
//     { description: 'The foo value', type: 'string', const: 'foo' },
//     { description: 'The bar value', type: 'string', const: 'bar' },
//     { description: 'The baz value', type: 'string', const: 'baz' }
//   ]
// }
