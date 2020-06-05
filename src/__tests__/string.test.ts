import * as z from '..';

const minFive = z.string().min(5, 'min5');
const maxFive = z.string().max(5, 'max5');
const justFive = z.string().length(5);
const nonempty = z.string().nonempty('nonempty');

test('passing validations', () => {
  minFive.parse('12345');
  minFive.parse('123456');
  maxFive.parse('12345');
  maxFive.parse('1234');
  nonempty.parse('1');
  justFive.parse('12345');
});

test('failing validations', () => {
  expect(() => minFive.parse('1234')).toThrow();
  expect(() => maxFive.parse('123456')).toThrow();
  expect(() => nonempty.parse('')).toThrow();
  expect(() => justFive.parse('1234')).toThrow();
  expect(() => justFive.parse('123456')).toThrow();
});
