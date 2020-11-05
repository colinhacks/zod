const test = Deno.test;
import { expect } from "https://deno.land/x/expect/mod.ts";import * as z from '../index.ts';
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
