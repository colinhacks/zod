// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { z } from "..";

test("preprocess test suite", () => {
  expect(z.string().email().preprocess(v => v.trim()).parse(' aaa@bbb.ccc ')).toBe("aaa@bbb.ccc");
  z.string().max(3).preprocess(v => v.slice(0,3)).parse('abcde')
  try {
    z.string().max(3).preprocess(v => v.slice(0,4)).parse('abcde')
  } catch (e) {
    expect(e).toBeInstanceOf(z.ZodError)
  }
  // @ts-expect-error
  expect(z.number().preprocess(v => v.trim()).parse(1)).toEqual({invalid_data: true})
  expect(z.number().preprocess(v => v+1).parse(1)).toBe(2)
  expect(z.number().preprocess(v => v+1).refine(v => v>1).parse(1)).toBe(2)
  expect(z.boolean().preprocess(() => false).parse(true)).toBe(false)
  expect(z.enum(['A','B']).preprocess(() => 'B').parse('A')).toBe('B')
  expect(z.number().preprocess(v => v+1).transform(v => v+1).parse(1)).toBe(3);
  expect(z.number().transform(v => v+1).preprocess(v => v+1).parse(1)).toBe(3);
  expect(z.number().default(1).preprocess(v => (v ?? 0) + 1).parse(undefined)).toBe(2);
  expect(z.string().nullable().preprocess(() => null).parse('abcde')).toBe(undefined);
  expect(z.string().optional().preprocess(() => undefined).parse('abcde')).toBe(undefined);
});

