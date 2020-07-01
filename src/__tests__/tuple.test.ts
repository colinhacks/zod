import * as z from '../index';
import { ZodError } from '../ZodError';
import { util } from '../helpers/util';

// const blue = z.literal('blue');
// type blue = z.infer<typeof blue>;

// const FishEnum = z.enum([z.literal('Salmon'), z.literal('Tuna'), z.literal('Trout')]);

// const FishEnum = z.enum([z.literal('Salmon'), z.literal('Tuna'), z.literal('Trout')]);

const testTuple = z.tuple([z.string(), z.object({ name: z.literal('Rudy') }), z.array(z.literal('blue'))]);

test('tuple inference', () => {
  const args1 = z.tuple([z.string()]);
  const returns1 = z.number();
  const func1 = z.function(args1, returns1);
  type func1 = z.TypeOf<typeof func1>;
  const t1: util.AssertEqual<func1, (k: string) => number> = true;
  [t1];
});

test('successful validation', () => {
  testTuple.parse(['asdf', { name: 'Rudy' }, ['blue']]);
});

test('failed validation', () => {
  const checker = () => {
    testTuple.parse([123, { name: 'Rudy2' }, ['blue', 'red']] as any);
  };
  try {
    checker();
  } catch (err) {
    // console.log(err);
    if (err instanceof ZodError) {
      expect(err.errors.length).toEqual(3);
    }
  }
  // expect(checker).toThrow()
});
