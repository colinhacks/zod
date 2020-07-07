import * as z from '../index';

test('parse strict object with unknown keys', () => {
  expect(() => z.object({ name: z.string() }).parse({ name: 'bill', unknownKey: 12 })).toThrow();
});

test('parse nonstrict object with unknown keys', () => {
  z.object({ name: z.string() }).nonstrict().parse({ name: 'bill', unknownKey: 12 });
});

test('invalid left side of intersection', () => {
  expect(() => z.intersection(z.string(), z.number()).parse(12)).toThrow();
});

test('invalid right side of intersection', () => {
  expect(() => z.intersection(z.string(), z.number()).parse('12')).toThrow();
});

test('parsing non-array in tuple schema', () => {
  expect(() => z.tuple([]).parse('12')).toThrow();
});

test('incorrect num elements in tuple', () => {
  expect(() => z.tuple([]).parse(['asdf'])).toThrow();
});

test('invalid enum value', () => {
  expect(() => z.enum(['Blue']).parse('Red')).toThrow();
});

test('parsing unknown', () => {
  z.string().parse('Red' as unknown);
});
