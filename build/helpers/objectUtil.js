"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeObjects = exports.mergeShapes = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const base_1 = require("../types/base");
const intersection_1 = require("../types/intersection");
const object_1 = require("../types/object");
// export type ObjectType<T extends ZodRawShape> = FlattenObject<ObjectIntersection<T>>;
exports.mergeShapes = (first, second) => {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);
    const sharedKeys = firstKeys.filter((k) => secondKeys.indexOf(k) !== -1);
    const sharedShape = {};
    for (const k of sharedKeys) {
        sharedShape[k] = intersection_1.ZodIntersection.create(first[k], second[k]);
    }
    return {
        ...first,
        ...second,
        ...sharedShape,
    };
};
exports.mergeObjects = (first) => (second) => {
    const mergedShape = exports.mergeShapes(first._def.shape, second._def.shape);
    const merged = new object_1.ZodObject({
        t: base_1.ZodTypes.object,
        checks: [...(first._def.checks || []), ...(second._def.checks || [])],
        // strict: first.params.strict && second.params.strict,
        params: {
            strict: first.params.strict && second.params.strict,
        },
        shape: mergedShape,
    });
    return merged;
};
//# sourceMappingURL=objectUtil.js.map