import * as z from '../index';
import { util } from '../helpers/util';

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});

test('object type inference', () => {
  type TestType = {
    f1: number;
    f2?: string | undefined;
    f3: string | null;
    f4: { t: string | boolean }[];
  };

  const t1: util.AssertEqual<z.TypeOf<typeof Test>, TestType> = true;
  [t1];
});

test('unknown throw', () => {
  const asdf: unknown = 35;
  expect(() => Test.parse(asdf)).toThrow();
});

test('correct parsing', () => {
  Test.parse({
    f1: 12,
    f2: 'string',
    f3: 'string',
    f4: [
      {
        t: 'string',
      },
    ],
  });

  Test.parse({
    f1: 12,
    f3: null,
    f4: [
      {
        t: false,
      },
    ],
  });
});

test('incorrect #1', () => {
  expect(() => Test.parse({} as any)).toThrow();
});

test('nonstrict', () => {
  z.object({ points: z.number() })
    .nonstrict()
    .parse({
      points: 2314,
      unknown: 'asdf',
    });
});
