import * as z from '../index';
import { util } from '../helpers/util';

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
type Test = z.infer<typeof Test>;

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

test('primitives', () => {
  const baseObj = z.object({
    stringPrimitive: z.string(),
    stringArrayPrimitive: z.array(z.string()),
    numberPrimitive: z.number(),
    numberArrayPrimitive: z.array(z.number()),
    booleanPrimitive: z.boolean(),
    booleanArrayPrimitive: z.array(z.boolean()),
    bigintPrimitive: z.bigint(),
    bigintArrayPrimitive: z.array(z.bigint()),
    undefinedPrimitive: z.undefined(),
    nullPrimitive: z.null(),
    primitiveUnion: z.union([z.string(), z.number()]),
    primitiveIntersection: z.intersection(z.string(), z.string()),
    lazyPrimitive: z.lazy(() => z.string()),
    literalPrimitive: z.literal('sup'),
    enumPrimitive: z.enum(['asdf', 'qwer']),
    datePrimitive: z.date(),
    nonprimitiveUnion: z.union([z.string(), z.tuple([])]),
    object: z.object({}),
    objectArray: z.object({}).array(),
  });

  // const asdf = baseObj.primitives();

  console.log(JSON.stringify(Object.keys(baseObj.nonprimitives()), null, 2));

  expect(Object.keys(baseObj.primitives().shape)).toEqual([
    'stringPrimitive',
    'stringArrayPrimitive',
    'numberPrimitive',
    'numberArrayPrimitive',
    'booleanPrimitive',
    'booleanArrayPrimitive',
    'bigintPrimitive',
    'bigintArrayPrimitive',
    'undefinedPrimitive',
    'nullPrimitive',
    'primitiveUnion',
    'primitiveIntersection',
    'lazyPrimitive',
    'literalPrimitive',
    'enumPrimitive',
    'datePrimitive',
  ]);

  expect(Object.keys(baseObj.nonprimitives().shape)).toEqual(['nonprimitiveUnion', 'object', 'objectArray']);
});
