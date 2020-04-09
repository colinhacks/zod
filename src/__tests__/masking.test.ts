import * as z from '..';

const player = z.object({
  username: z.string(),
  points: z.number(),
});

// player;
// const masked = player.mask({});

test('masking test', () => {
  player;
  // const masked = player.mask({ points: true });
  // masked.parse({ points: 1234 });
});
