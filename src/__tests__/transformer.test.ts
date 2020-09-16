import * as z from '..';
import { util } from '../helpers/util';

test('basic transformations', () => {
  const r1 = z
    .transformer(z.string(), z.number(), data => data.length)
    .parse('asdf');
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

test('async coercion', async () => {
  const numToString = z.transformer(z.number(), z.string(), async n =>
    String(n),
  );
  const data = await z
    .object({
      id: numToString,
    })
    .parseAsync({ id: 5 });

  expect(data).toEqual({ id: '5' });
  return 'asdf';
});

test('sync coercion async error', async () => {
  const numToString = z.transformer(z.number(), z.string(), async n =>
    String(n),
  );
  expect(() =>
    z
      .object({
        id: numToString,
      })
      .parse({ id: 5 }),
  ).toThrow();
  return 'asdf';
  // expect(data).toEqual({ id: '5' });
});

test('default', () => {
  const data = z
    .string()
    .default('asdf')
    .parse(undefined); // => "asdf"
  expect(data).toEqual('asdf');
});

test('object typing', () => {
  const t1 = z.object({
    stringToNumber: z.string().transform(z.number(), arg => arg.length),
  });

  type t1 = z.input<typeof t1>;
  type t2 = z.output<typeof t1>;

  const f1: util.AssertEqual<t1, { stringToNumber: string }> = true;
  const f2: util.AssertEqual<t2, { stringToNumber: number }> = true;
  f1;
  f2;
});

test('transform method overloads', () => {
  const t1 = z.string().transform(val => val.toUpperCase());
  expect(t1.parse('asdf')).toEqual('ASDF');

  const t2 = z.string().transform(z.number(), val => val.length);
  expect(t2.parse('asdf')).toEqual(4);
});
