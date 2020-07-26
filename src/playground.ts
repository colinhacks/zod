import * as z from '.';

type SomeObjType = { three?: 'hi'; one: number; anotherSomeObj: SomeObjType };

const SomeObj: z.Schema<SomeObjType> = z.object({
  three: z.literal('hi').optional(),
  one: z.number(),
  anotherSomeObj: z.lazy(() => SomeObj),
});

const TestSchema = z.object({
  three: z.literal('hi').optional(),
  one: z.number(),
  two: z.literal(3),
  four: SomeObj,
  five: z.array(
    z.object({
      three: z.literal('hi').optional(),
      one: z.number(),
      two: z.literal(3),
      four: SomeObj,
      five: z.date(),
    }),
  ),
});
