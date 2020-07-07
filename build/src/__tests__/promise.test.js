"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("..");
const ZodError_1 = require("../ZodError");
const promSchema = z.promise(z.object({
    name: z.string(),
    age: z.number(),
}));
test('promise inference', () => {
    const t1 = true;
    expect(t1).toBeTruthy();
});
test('promise parsing success', () => {
    promSchema.parse(Promise.resolve({ name: 'Bobby', age: 10 }));
});
test('promise parsing success 2', () => {
    // tslint:disable-next-line: no-empty
    promSchema.parse({ then: () => { }, catch: () => { } });
});
test('promise parsing fail', () => {
    const bad = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
    expect(bad).rejects.toBeCalled();
});
test('promise parsing fail 2', () => {
    const failPromise = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }));
    failPromise.catch((err) => {
        expect(err instanceof ZodError_1.ZodError).toEqual(true);
    });
});
test('promise parsing fail', () => {
    // tslint:disable-next-line: no-empty
    const bad = () => promSchema.parse({ then: () => { }, catch: {} });
    expect(bad).toThrow();
});
const asyncFunction = z.function(z.tuple([]), promSchema);
test('async function pass', () => {
    const validatedFunction = asyncFunction.implement(async () => {
        return { name: 'jimmy', age: 14 };
    });
    expect(validatedFunction()).resolves.toBeCalled();
});
test('async function fail', () => {
    const validatedFunction = asyncFunction.implement(() => {
        return Promise.resolve('asdf');
    });
    expect(validatedFunction()).resolves.toBeCalled();
});
//# sourceMappingURL=promise.test.js.map