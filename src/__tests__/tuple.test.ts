import * as z from '../index';
import { ZodError } from '../ZodError';
import { util } from '../helpers/util';

const testTuple = z.tuple([
  z.string(),
  z.object({ name: z.literal('Rudy') }),
  z.array(z.literal('blue')),
]);
const testData = ['asdf', { name: 'Rudy' }, ['blue']];
const badData = [123, { name: 'Rudy2' }, ['blue', 'red']];

test('tuple inference', () => {
  const args1 = z.tuple([z.string()]);
  const returns1 = z.number();
  const func1 = z.function(args1, returns1);
  type func1 = z.TypeOf<typeof func1>;
  const t1: util.AssertEqual<func1, (k: string) => number> = true;
  [t1];
});

test('successful validation', () => {
  const val = testTuple.parse(testData);
  expect(val).toEqual(['asdf', { name: 'Rudy' }, ['blue']]);
});

test('successful async validation', async () => {
  const val = await testTuple.parseAsync(testData);
  return expect(val).toEqual(testData);
});

test('failed validation', () => {
  const checker = () => {
    testTuple.parse([123, { name: 'Rudy2' }, ['blue', 'red']] as any);
  };
  try {
    checker();
  } catch (err) {
    if (err instanceof ZodError) {
      expect(err.errors.length).toEqual(3);
    }
  }
});

test('failed safe validation', () => {
  const res = testTuple.safeParse(badData);
  expect(res.success).toEqual(false);
  if (!res.success) {
    expect(res.error.errors.length).toEqual(3);
  }
  // try {
  //   checker();
  // } catch (err) {
  //   if (err instanceof ZodError) {
  //     expect(err.errors.length).toEqual(3);
  //   }
  // }
});
