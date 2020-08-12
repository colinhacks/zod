import * as z from '.';

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

console.log(JSON.stringify(Object.keys(baseObj.primitives().shape), null, 2));
console.log(JSON.stringify(Object.keys(baseObj.nonprimitives().shape), null, 2));
