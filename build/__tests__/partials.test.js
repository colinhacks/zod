"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("..");
const nested = z.object({
    name: z.string(),
    age: z.number(),
    outer: z.object({
        inner: z.string(),
    }),
});
test('shallow inference', () => {
    const shallow = nested.partial();
    const t1 = true;
    expect(t1).toBeTruthy();
});
test('shallow partial parse', () => {
    const shallow = nested.partial();
    shallow.parse({});
    shallow.parse({
        name: 'asdf',
        age: 23143,
    });
});
test('deep partial inference', () => {
    const deep = nested.deepPartial();
    const t1 = true;
    expect(t1).toBeTruthy();
});
test('deep partial parse', () => {
    const deep = nested.deepPartial();
    deep.parse({});
    deep.parse({
        outer: {},
    });
    deep.parse({
        name: 'asdf',
        age: 23143,
        outer: {
            inner: 'adsf',
        },
    });
});
//# sourceMappingURL=partials.test.js.map