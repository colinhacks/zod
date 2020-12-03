// @ts-ignore TS6133
import {
  describe,
  expect,
  test,
} from 'https://deno.land/x/expect@v0.2.6/mod.ts';

import * as z from '../index.ts';
const stringSchema = z.string();

test('safeparse fail', () => {
  const safe = stringSchema.safeParse(12);
  expect(safe.success).toEqual(false);
  expect((safe as any).error).toBeInstanceOf(z.ZodError);
});

test('safeparse pass', () => {
  const safe = stringSchema.safeParse('12');
  expect(safe.success).toEqual(true);
  expect((safe as any).data).toEqual('12');
});

test('safeparse unexpected error', () => {
  expect(() =>
    stringSchema
      .refine(data => {
        throw new Error(data);
      })
      .safeParse('12'),
  ).toThrow();
});
