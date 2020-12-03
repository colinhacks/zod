// @ts-ignore TS6133
import { describe, expect, test } from '@jest/globals';

import * as z from '../index';
import { crazySchema } from '../crazySchema';

test('ZodCodeGenerator', () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  gen.dump();
});
