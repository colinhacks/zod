import * as z from '..';

const player = z.object({
  username: z.string(),
  points: z.number(),
});

// player;
// const masked = player.mask({});

test('masking test', () => {
  const masked1 = player.mask({ points: true });
  masked1.parse({ points: 1234 });

  const bad1 = () => masked1.parse({ points: 1324, username: 'bob' } as any);
  expect(bad1).toThrow();
});
