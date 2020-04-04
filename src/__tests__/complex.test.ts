import * as z from '../index';
// import { AssertEqual } from '../helpers/util';

// const blue = z.literal('blue');
// type blue = z.infer<typeof blue>;

// const FishEnum = z.enum([z.literal('Salmon'), z.literal('Tuna'), z.literal('Trout')]);

// const FishEnum = z.enum([z.literal('Salmon'), z.literal('Tuna'), z.literal('Trout')]);

const crazySchema = z.object({
  tuple: z.tuple([
    z
      .string()
      .nullable()
      .optional(),
    z
      .number()
      .nullable()
      .optional(),
    z
      .boolean()
      .nullable()
      .optional(),
    z
      .null()
      .nullable()
      .optional(),
    z
      .undefined()
      .nullable()
      .optional(),
    z
      .literal('1234')
      .nullable()
      .optional(),
  ]),
  merged: z
    .object({
      k1: z.string().optional(),
    })
    .merge(z.object({ k1: z.string().nullable(), k2: z.number() })),
  union: z.array(z.union([z.literal('asdf'), z.literal(12)])).nonempty(),
  array: z.array(z.number()),
  intersection: z.intersection(z.object({ p1: z.string().optional() }), z.object({ p1: z.number().optional() })),
  enum: z.intersection(z.enum(['zero', 'one']), z.enum(['one', 'two'])),
  nonstrict: z.object({ points: z.number() }).nonstrict(),
});

test('parse', () => {
  crazySchema.parse({
    tuple: ['asdf', 1234, true, null, undefined, '1234'],
    merged: { k1: 'asdf', k2: 12 },
    union: ['asdf', 12, 'asdf', 12, 'asdf', 12],
    array: [12, 15, 16],
    intersection: {},
    enum: 'one',
    nonstrict: { points: 1234 },
  });
});

test('to JSON', () => {
  crazySchema.toJSON();
});

const stringSchema = z.string();
test('type guard', () => {
  if (stringSchema.check('adsf' as any)) {
  }
});

test('type guard fail', () => {
  if (crazySchema.check('asdf' as any)) {
  }
});

test('type guard (is)', () => {
  if (stringSchema.is('asdf' as any)) {
  }
});
test('type guard failure (is)', () => {
  if (crazySchema.is('asdf' as any)) {
  }
});
