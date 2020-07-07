"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require("../index");
test('create enum', () => {
    const MyEnum = z.enum(['Red', 'Green', 'Blue']);
    expect(MyEnum.Values.Red === 'Red').toBeTruthy();
});
test('infer enum', () => {
    const MyEnum = z.enum(['Red', 'Green', 'Blue']);
    const t1 = true;
    expect(t1).toBeTruthy();
});
//# sourceMappingURL=enum.test.js.map