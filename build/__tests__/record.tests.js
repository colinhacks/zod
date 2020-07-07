"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("..");
const booleanRecord = z.record(z.boolean());
test('type inference', () => {
    const f1 = true;
    expect(f1).toBeTruthy();
});
test('methods', () => {
    booleanRecord.toJSON();
    booleanRecord.optional();
    booleanRecord.nullable();
});
test('string record parse - pass', () => {
    booleanRecord.parse({
        k1: true,
        k2: false,
        1234: false,
    });
});
test('string record parse - fail', () => {
    const badCheck = () => booleanRecord.parse({
        asdf: 1234,
    });
    expect(badCheck).toThrow();
});
test('string record parse - fail', () => {
    const badCheck = () => booleanRecord.parse({
        asdf: {},
    });
    expect(badCheck).toThrow();
});
test('string record parse - fail', () => {
    const badCheck = () => booleanRecord.parse({
        asdf: [],
    });
    expect(badCheck).toThrow();
});
//# sourceMappingURL=record.tests.js.map