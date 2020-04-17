import * as z from '..';

const nested = z.object({
  outer: z.object({
    inner: z.object({
      core: z.object({
        data: z.string(),
      }),
    }),
  }),
});

test('shallow partial', () => {
  nested;
});
