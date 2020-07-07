"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("..");
const fish = z.object({
    name: z.string(),
    age: z.number(),
    nested: z.object({}),
});
test('pick type inference', () => {
    const nameonlyFish = fish.pick({ name: true });
    const f1 = true;
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
    const f1 = true;
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
    const f1 = true;
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
//# sourceMappingURL=pickomit.test.js.map