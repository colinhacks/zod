"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("../index");
const args1 = z.tuple([z.string()]);
const returns1 = z.number();
const func1 = z.function(args1, returns1);
test('function parsing', () => {
    const parsed = func1.parse((arg) => arg.length);
    parsed('asdf');
});
test('parsed function fail 1', () => {
    const parsed = func1.parse((x) => x);
    expect(() => parsed('asdf')).toThrow();
});
test('parsed function fail 2', () => {
    const parsed = func1.parse((x) => x);
    expect(() => parsed(13)).toThrow();
});
test('function inference 1', () => {
    const t1 = true;
    expect(t1).toBeTruthy();
});
const args2 = z.tuple([
    z.object({
        f1: z.number(),
        f2: z.string().nullable(),
        f3: z.array(z.boolean().optional()).optional(),
    }),
]);
const returns2 = z.union([z.string(), z.number()]);
const func2 = z.function(args2, returns2);
test('function inference 2', () => {
    const t2 = true;
    expect(t2).toBeTruthy();
});
test('valid function run', () => {
    const validFunc2Instance = func2.validate(() => {
        return 'adf';
    });
    const checker = () => {
        validFunc2Instance({
            f1: 21,
            f2: 'asdf',
            f3: [true, false],
        });
    };
    checker();
});
test('input validation error', () => {
    const invalidFuncInstance = func2.validate(() => {
        return 'adf';
    });
    const checker = () => {
        invalidFuncInstance('Invalid_input');
    };
    expect(checker).toThrow();
});
test('output validation error', () => {
    const invalidFuncInstance = func2.validate(() => {
        return ['this', 'is', 'not', 'valid', 'output'];
    });
    const checker = () => {
        invalidFuncInstance({
            f1: 21,
            f2: 'asdf',
            f3: [true, false],
        });
    };
    expect(checker).toThrow();
});
//# sourceMappingURL=function.test.js.map