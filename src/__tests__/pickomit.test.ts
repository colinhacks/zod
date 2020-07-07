import * as z from '..';
import * as util from '../helpers/util';

const fish = z.object({
  name: z.string(),
  age: z.number(),
  nested: z.object({}),
});

test('pick type inference', () => {
  const nameonlyFish = fish.pick({ name: true });
  type nameonlyFish = z.infer<typeof nameonlyFish>;
  const f1: util.AssertEqual<nameonlyFish, { name: string }> = true;
  expect(f1).toBeTruthy();
});

test('pick parse - success', () => {
  const nameonlyFish = fish.pick({ name: true });
  nameonlyFish.parse({ name: 'bob' });
});

test('pick parse - fail', () => {
  const nameonlyFish = fish.pick({ name: true });
  const bad1 = () => nameonlyFish.parse({ name: 12 });
  const bad2 = () => nameonlyFish.parse({ name: 'bob', age: 12 });
  const bad3 = () => nameonlyFish.parse({ age: 12 });

  expect(bad1).toThrow();
  expect(bad2).toThrow();
  expect(bad3).toThrow();
});

test('omit type inference', () => {
  const nonameFish = fish.omit({ name: true });
  type nonameFish = z.infer<typeof nonameFish>;
  const f1: util.AssertEqual<nonameFish, { age: number; nested: {} }> = true;
  expect(f1).toBeTruthy();
});

test('omit parse - success', () => {
  const nonameFish = fish.omit({ name: true });
  nonameFish.parse({ age: 12, nested: {} });
});

test('omit parse - fail', () => {
  const nonameFish = fish.omit({ name: true });
  const bad1 = () => nonameFish.parse({ name: 12 });
  const bad2 = () => nonameFish.parse({ age: 12 });
  const bad3 = () => nonameFish.parse({});

  expect(bad1).toThrow();
  expect(bad2).toThrow();
  expect(bad3).toThrow();
});

test('nonstrict inference', () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  type laxfish = z.infer<typeof laxfish>;
  const f1: util.AssertEqual<laxfish, { [k: string]: unknown; name: string }> = true;
  expect(f1).toBeTruthy();
});

test('nonstrict parsing - pass', () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  laxfish.parse({ name: 'asdf', whatever: 'asdf' });
  laxfish.parse({ name: 'asdf', age: 12, nested: {} });
});

test('nonstrict parsing - fail', () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  const bad = () => laxfish.parse({ whatever: 'asdf' });
  expect(bad).toThrow();
});
