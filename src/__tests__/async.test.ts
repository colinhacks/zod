import * as z from '..';

test('parse async test', async () => {
  const schema = z.string().refine(async _val => false);
  expect(() => schema.parse('asdf')).toThrow();
});

test('parseAsync async test', async () => {
  const schema1 = z.string().refine(async _val => true);
  await schema1.parseAsync('asdf');

  const schema2 = z.string().refine(async _val => false);
  expect(schema2.parseAsync('asdf')).rejects;
  // expect(async () => await schema2.parseAsync('asdf')).toThrow();
});

test('parseAsync async with value', async () => {
  const schema1 = z.string().refine(async val => {
    return val.length > 5;
  });
  expect(schema1.parseAsync('asdf')).rejects;

  const v = await schema1.parseAsync('asdf123');
  expect(v).toEqual('asdf123');
});
