import * as z from '../index';
import { util } from '../helpers/util';

const stringMap = z.map(z.string(), z.string());
type stringMap = z.infer<typeof stringMap>;

test('type inference', () => {
  const f1: util.AssertEqual<stringMap, Map<string, string>> = true;
  f1;
});

test('doesn’t throw when a valid value is given', () => {
  expect(() =>
    stringMap.parse(
      new Map([
        ['first', 'foo'],
        ['second', 'bar'],
      ]),
    ),
  ).not.toThrow();
});

test('throws when a Set is given', () => {
  expect(() => stringMap.parse(new Set([]))).toThrow(
    '1 validation issue(s)\n\n  Issue #0: invalid_type at \n  Expected map, received object\n',
  );
});

test('throws when the given map has invalid key and invalid value', () => {
  expect(() => {
    stringMap.parse(new Map([[42, Symbol()]]));
  }).toThrow(
    '2 validation issue(s)\n\n  Issue #0: invalid_type at 0.key\n  Expected string, received number\n\n  Issue #1: invalid_type at 0.value\n  Expected string, received symbol\n',
  );
});

test('throws when the given map has multiple invalid entries', () => {
  expect(() => {
    stringMap.parse(
      new Map([
        [1, 'foo'],
        ['bar', 2],
      ] as [any, any][]) as Map<any, any>,
    );
  }).toThrow(
    '2 validation issue(s)\n\n  Issue #0: invalid_type at 0.key\n  Expected string, received number\n\n  Issue #1: invalid_type at 1.value\n  Expected string, received number\n',
  );
});
