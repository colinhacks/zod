import * as z from '..';

test('basic transformations', () => {
  const r1 = z.transformer(z.string(), z.number(), data => data.length).parse('asdf');
  expect(r1).toEqual(4);
});

test('coercion', () => {
  const numToString = z.transformer(z.number(), z.string(), n => String(n));
  const data = z
    .object({
      id: numToString,
    })
    .parse({ id: 5 });
  expect(data).toEqual({ id: '5' });
});

test('default', () => {
  const data = z
    .string()
    .default('asdf')
    .parse(undefined); // => "asdf"
  expect(data).toEqual('asdf');
});
