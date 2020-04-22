import * as z from '..';
import { util } from '../helpers/util';
import { ZodError } from '../ZodError';

const promSchema = z.promise(
  z.object({
    name: z.string(),
    age: z.number(),
  }),
);

test('promise inference', () => {
  type promSchemaType = z.infer<typeof promSchema>;
  const t1: util.AssertEqual<promSchemaType, Promise<{ name: string; age: number }>> = true;
  t1;
});

test('promise parsing success', () => {
  promSchema.parse(Promise.resolve({ name: 'Bobby', age: 10 }));
});

test('promise parsing success 2', () => {
  promSchema.parse({ then: () => {}, catch: () => {} });
});

test('promise parsing fail', () => {
  const bad = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
  expect(bad).rejects;
});

test('promise parsing fail 2', () => {
  const failPromise = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
  failPromise.catch(err => {
    expect(err instanceof ZodError).toEqual(true);
  });
});

test('promise parsing fail', () => {
  const bad = () => promSchema.parse({ then: () => {}, catch: {} });
  expect(bad).toThrow();
});

const asyncFunction = z.function(z.tuple([]), promSchema);

test('async function pass', () => {
  const validatedFunction = asyncFunction.implement(async () => {
    return { name: 'jimmy', age: 14 };
  });
  expect(validatedFunction()).resolves;
});

test('async function fail', () => {
  const validatedFunction = asyncFunction.implement(() => {
    return Promise.resolve('asdf' as any);
  });
  expect(validatedFunction()).rejects;
});
