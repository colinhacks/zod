// @ts-ignore TS6133
import { describe, expect, test } from 'https://deno.land/x/expect@v0.2.6/mod.ts';

import * as z from '../index.ts';
import { util } from '../helpers/util.ts';
test('void', () => {
  const v = z.void();
  v.parse(null);
  v.parse(undefined);

  expect(() => v.parse('')).toThrow();

  type v = z.infer<typeof v>;
  const t1: util.AssertEqual<v, void> = true;
  t1;
});
