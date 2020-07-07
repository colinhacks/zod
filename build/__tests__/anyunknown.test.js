"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("..");
test('check any inference', () => {
    const t1 = z.any();
    const f1 = true;
    expect(f1).toBeTruthy();
});
test('check unknown inference', () => {
    const t1 = z.unknown();
    const f1 = true;
    expect(f1).toBeTruthy();
});
//# sourceMappingURL=anyunknown.test.js.map