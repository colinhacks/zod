import * as z from '..';

const minTwo = z
  .string()
  .array()
  .min(2);

const maxTwo = z
  .string()
  .array()
  .max(2);

const justTwo = z
  .string()
  .array()
  .length(2);

const intNum = z
  .string()
  .array()
  .nonempty();

test('passing validations', () => {
  minTwo.parse(['a', 'a']);
  minTwo.parse(['a', 'a', 'a']);
  maxTwo.parse(['a', 'a']);
  maxTwo.parse(['a']);
  justTwo.parse(['a', 'a']);
  intNum.parse(['a']);
});

test('failing validations', () => {
  expect(() => minTwo.parse(['a'])).toThrow();
  expect(() => maxTwo.parse(['a', 'a', 'a'])).toThrow();
  expect(() => justTwo.parse(['a'])).toThrow();
  expect(() => justTwo.parse(['a', 'a', 'a'])).toThrow();
  expect(() => intNum.parse([])).toThrow();
});

test('parse empty array in nonempty', () => {
  expect(() =>
    z
      .array(z.string())
      .nonempty()
      .parse([] as any),
  ).toThrow();
});
