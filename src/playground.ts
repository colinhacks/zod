import * as z from '.';

const XmlJsonArray = <Key extends string, Schema extends z.ZodTypeAny>(
  element: Key,
  schema: Schema,
) => {
  return z.object({}).setKey(element, z.union([schema, z.array(schema)]));
};

const test = XmlJsonArray('asdf', z.string());

console.log(
  test.parse({
    asdf: 'assdf',
  }),
);

console.log(
  test.parse({
    asdf: ['assdf'],
  }),
);

type test = z.infer<typeof test>;
