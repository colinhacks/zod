import * as z from '..';
import { crazySchema } from './complex.test';

test('ZodCodeGenerator', () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  console.log(gen.dump());
});
