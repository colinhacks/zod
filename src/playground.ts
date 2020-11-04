import * as z from '.';

const ConfigSchema = z.object({
  /** The name to use. */
  name: z.string().default('blah'),

  /** Another nested part. */
  nested: z.object({
    value: z.number(),
    val2: z.string().default('tuna'),
  }),
  // .default({
  //   value: 20,
  //   val2: 'null',
  // }),
  another: z.number(),
});
ConfigSchema;

// console.log(ConfigSchema.deepPartial().parse({}));

console.log(
  z
    .object({
      errorFormat: z.string(),
    })
    .strict()
    .safeParse({
      errorrFormat: 'asdf',
      errorFormat: 1243,
    }),
);
