import * as z from '..';
// import { maskUtil } from '../helpers/maskUtil';

// type Test = {
//   name: string;
//   nest: {
//     name: string;
//   };
//   address: {
//     line1: string;
//   };
//   inventory: {
//     name: string;
//     quantity: number;
//   }[];
//   intersection: {
//     name1: string;
//     quantity: number;
//   } & { name2: string; quantity: number };
//   never: {
//     name: string;
//   } & { quantity: number };
//   union:
//     | {
//         name: string;
//       }
//     | { quantity: number };
//   optinventory:
//     | {
//         name: string;
//         quantity: number;
//       }[]
//     | undefined;
//   names: string[];
//   optnames: string[] | null;
//   nothing: null;
//   undef: undefined;
//   tuple: [string, { name: string }];
// };

// export type TestParams = maskUtil.Params<Test>;

// type NoBool<T> = T extends boolean ? never : T;

const fish = z.object({
  name: z.string(),
  props: z.object({
    color: z.string(),
    numScales: z.number(),
  }),
});

const nonStrict = z
  .object({
    name: z.string(),
    color: z.string(),
  })
  .nonstrict();

test('object whitelist type', () => {
  const modNonStrictFish = nonStrict.blacklist({ name: true });
  modNonStrictFish.parse({ color: 'asdf' });

  const bad1 = () => fish.whitelist({ props: { unknown: true } } as any);
  const bad2 = () => fish.blacklist({ name: true, props: { unknown: true } } as any);

  expect(bad1).toThrow();
  expect(bad2).toThrow();
});

test('f1', () => {
  const f1 = fish.whitelist(true);
  f1.parse({ name: 'a', props: { color: 'b', numScales: 3 } });
});
test('f2', () => {
  const f2 = fish.whitelist({ props: true });
  f2.parse({ props: { color: 'asdf', numScales: 1 } });
  const badcheck2 = () => f2.parse({ name: 'a', props: { color: 'b', numScales: 3 } } as any);
  expect(badcheck2).toThrow();
});
test('f3', () => {
  const f3 = fish.whitelist({ props: { color: true } });
  f3.parse({ props: { color: 'b' } });
  const badcheck3 = () => f3.parse({ name: 'a', props: { color: 'b', numScales: 3 } } as any);
  expect(badcheck3).toThrow();
});
test('f4', () => {
  const badcheck4 = () => fish.whitelist({ props: { color: true, unknown: true } });
  expect(badcheck4).toThrow();
});
test('f6', () => {
  const f6 = fish.blacklist({ props: true });
  const badcheck6 = () => f6.parse({ name: 'a', props: { color: 'b', numScales: 3 } } as any);
  f6.parse({ name: 'adsf' });
  expect(badcheck6).toThrow();
});
test('f7', () => {
  const f7 = fish.blacklist({ props: { color: true } });
  f7.parse({ name: 'a', props: { numScales: 3 } });
  const badcheck7 = () => f7.parse({ name: 'a', props: { color: 'b', numScales: 3 } } as any);
  expect(badcheck7).toThrow();
});
test('f8', () => {
  const badcheck8 = () => fish.blacklist({ props: { color: true, unknown: true } });
  expect(badcheck8).toThrow();
});
test('f9', () => {
  const f9 = nonStrict.whitelist(true);
  f9.parse({ name: 'a', color: 'asdf' });
});
test('f10', () => {
  const f10 = nonStrict.whitelist({ name: true });
  f10.parse({ name: 'a' });
  const val = f10.parse({ name: 'a', color: 'b' });
  expect(val).toStrictEqual({ name: 'a' });
});
test('f12', () => {
  const badfcheck12 = () => nonStrict.blacklist({ color: true, asdf: true });
  expect(badfcheck12).toThrow();
});

test('array masking', () => {
  const fishArray = z.array(fish);
  const modFishArray = fishArray.whitelist({
    name: true,
    props: {
      numScales: true,
    },
  });

  modFishArray.parse([{ name: 'fish', props: { numScales: 12 } }]);
  const bad1 = () => modFishArray.parse([{ name: 'fish', props: { numScales: 12, color: 'asdf' } }] as any);
  expect(bad1).toThrow();
});

test('array masking', () => {
  const fishArray = z.array(fish);
  const fail = () =>
    fishArray.whitelist({
      name: true,
      props: {
        whatever: true,
      },
    } as any);
  expect(fail).toThrow();
});

test('array masking', () => {
  const fishArray = z.array(fish);
  const fail = () =>
    fishArray.blacklist({
      whateve: true,
    } as any);
  expect(fail).toThrow();
});

test('array masking', () => {
  const fishArray = z.array(fish);
  const modFishList = fishArray.blacklist({
    name: true,
    props: {
      color: true,
    },
  });

  modFishList.parse([{ props: { numScales: 12 } }]);
  const fail = () => modFishList.parse([{ name: 'hello', props: { numScales: 12 } }] as any);
  expect(fail).toThrow();
});

test('primitive array masking', () => {
  const fishArray = z.array(z.number());
  const fail = () => fishArray.whitelist({} as any);
  expect(fail).toThrow();
});

test('other array masking', () => {
  const fishArray = z.array(z.array(z.number()));
  const fail = () => fishArray.whitelist({} as any);
  expect(fail).toThrow();
});

test('invalid mask #1', () => {
  const fail = () => fish.whitelist(1 as any);
  expect(fail).toThrow();
});

test('invalid mask #2', () => {
  const fail = () => fish.whitelist([] as any);
  expect(fail).toThrow();
});

test('invalid mask #3', () => {
  const fail = () => fish.whitelist(false as any);
  expect(fail).toThrow();
});

test('invalid mask #4', () => {
  const fail = () => fish.whitelist('asdf' as any);
  expect(fail).toThrow();
});

test('invalid mask #5', () => {
  const fail = () => fish.blacklist(1 as any);
  expect(fail).toThrow();
});

test('invalid mask #6', () => {
  const fail = () => fish.blacklist([] as any);
  expect(fail).toThrow();
});

test('invalid mask #7', () => {
  const fail = () => fish.blacklist(false as any);
  expect(fail).toThrow();
});

test('invalid mask #8', () => {
  const fail = () => fish.blacklist('asdf' as any);
  expect(fail).toThrow();
});
