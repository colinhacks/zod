import * as z from '../index';
import { crazySchema } from '../crazySchema';

test('ZodCodeGenerator', () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  gen.dump();
});
