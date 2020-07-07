"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("../index");
const ZodError_1 = require("../ZodError");
const testTuple = z.tuple([z.string(), z.object({ name: z.literal('Rudy') }), z.array(z.literal('blue'))]);
test('tuple inference', () => {
    const args1 = z.tuple([z.string()]);
    const returns1 = z.number();
    const func1 = z.function(args1, returns1);
    const t1 = true;
    expect(t1).toBeTruthy();
});
test('successful validation', () => {
    testTuple.parse(['asdf', { name: 'Rudy' }, ['blue']]);
});
test('failed validation', () => {
    const checker = () => {
        testTuple.parse([123, { name: 'Rudy2' }, ['blue', 'red']]);
    };
    try {
        checker();
    }
    catch (err) {
        if (err instanceof ZodError_1.ZodError) {
            expect(err.errors.length).toEqual(3);
        }
    }
});
//# sourceMappingURL=tuple.test.js.map