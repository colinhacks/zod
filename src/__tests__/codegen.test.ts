import * as z from '..';

test('ZodCodeGenerator', () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(z.string());
  gen.dump();
});
