"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("../index");
const Test = z.object({
    f1: z.number(),
    f2: z.string().optional(),
    f3: z.string().nullable(),
    f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
test('object type inference', () => {
    const t1 = true;
    expect(t1).toBeTruthy();
});
test('unknown throw', () => {
    const asdf = 35;
    expect(() => Test.parse(asdf)).toThrow();
});
test('correct parsing', () => {
    Test.parse({
        f1: 12,
        f2: 'string',
        f3: 'string',
        f4: [
            {
                t: 'string',
            },
        ],
    });
    Test.parse({
        f1: 12,
        f3: null,
        f4: [
            {
                t: false,
            },
        ],
    });
});
test('incorrect #1', () => {
    expect(() => Test.parse({})).toThrow();
});
test('nonstrict', () => {
    z.object({ points: z.number() }).nonstrict().parse({
        points: 2314,
        unknown: 'asdf',
    });
});
//# sourceMappingURL=object.test.js.map