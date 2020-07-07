"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ZodError_1 = require("../ZodError");
test('error creation', () => {
    const err = ZodError_1.ZodError.create([]);
    err.addError('', 'message 1');
    err.addError('path', 'message 1');
    err.addError(5, 'message 1');
    err.bubbleUp('upper');
    expect(err.empty).toBeFalsy();
    expect(err.errors.length).toEqual(3);
    err.merge(ZodError_1.ZodError.create([]));
    err.mergeChild('adsf', ZodError_1.ZodError.create([]));
    expect(err.errors.length).toEqual(3);
});
//# sourceMappingURL=error.test.js.map