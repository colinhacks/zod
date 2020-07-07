"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMask = void 0;
const z = require("./types/base");
const array_1 = require("./types/array");
const object_1 = require("./types/object");
exports.applyMask = (schema, mask, mode) => {
    const _def = schema._def;
    const def = _def;
    if (mask === true) {
        return schema;
    }
    else if (typeof mask === 'object' && !Array.isArray(mask)) {
        if (def.t === z.ZodTypes.array) {
            if (def.type._def.t === z.ZodTypes.object) {
                return new array_1.ZodArray({
                    t: z.ZodTypes.array,
                    nonempty: def.nonempty,
                    type: exports.applyMask(def.type, mask, mode),
                });
            }
            else {
                throw new Error(`You can only ${mode} arrays of objects.`);
            }
        }
        else if (def.t === z.ZodTypes.object) {
            const modShape = {};
            const shape = def.shape;
            if (mode === 'pick') {
                if (mask === true)
                    return shape;
                for (const key in mask) {
                    if (!Object.keys(shape).includes(key))
                        throw new Error(`Unknown key in pick: ${key}`);
                    modShape[key] = exports.applyMask(shape[key], mask[key], mode);
                }
            }
            if (mode === 'omit') {
                for (const maskKey in mask) {
                    if (!Object.keys(shape).includes(maskKey))
                        throw new Error(`Unknown key in omit: ${maskKey}`);
                }
                for (const key in shape) {
                    if (mask[key] === true) {
                        continue;
                    }
                    else if (typeof mask[key] === 'object') {
                        modShape[key] = exports.applyMask(shape[key], mask[key], mode);
                    }
                    else {
                        modShape[key] = shape[key];
                    }
                }
            }
            return new object_1.ZodObject({
                t: z.ZodTypes.object,
                params: def.params,
                shape: modShape,
            });
        }
    }
    throw new Error(`Invalid mask!\n\n${JSON.stringify(mask, null, 2)}`);
};
//# sourceMappingURL=oldmasker.js.map