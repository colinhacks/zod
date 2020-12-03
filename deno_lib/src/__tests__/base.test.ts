// @ts-ignore TS6133
import { expect } from 'https://deno.land/x/expect@v0.2.6/mod.ts';
const test = Deno.test;

import { util } from '../helpers/util.ts';

import * as z from '../index.ts';

test('type guard', () => {
  const stringToNumber = z.string().transform(z.number(), arg => arg.length);

  const s1 = z.object({
    stringToNumber,
  });
  type t1 = z.input<typeof s1>;

  const data: any = 'asdf';
  if (s1.check(data)) {
    const f1: util.AssertEqual<typeof data, t1> = true;
    f1;
  }
});
