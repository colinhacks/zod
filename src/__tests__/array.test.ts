import * as z from '..';

const minTwo = z.array(z.string()).min(2);
const maxTwo = z.array(z.string()).max(2);
const justTwo = z.array(z.string()).length(2);
const intNum = z.array(z.string()).nonempty();

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
