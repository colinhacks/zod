"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectType = exports.assertNever = void 0;
// export type ObjectsEqual<X extends object, Y extends object> = AssertEqual<X, Y> extends true
//   ? 'bad' extends { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }[keyof X &
//       keyof Y]
//     ? { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }
//     : true
//   : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(_) {
    throw new Error();
}
exports.assertNever = assertNever;
exports.getObjectType = (value) => {
    const objectName = `${value}`.slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return undefined;
};
//# sourceMappingURL=util.js.map