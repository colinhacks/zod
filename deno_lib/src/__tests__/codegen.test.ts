// @ts-ignore TS6133
import {
  describe,
  expect,
  test,
} from 'https://deno.land/x/expect@v0.2.6/mod.ts';

import * as z from '../index.ts';
import { crazySchema } from '../crazySchema.ts';

test('ZodCodeGenerator', () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  gen.dump();
});
