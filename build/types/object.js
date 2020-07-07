"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodObject = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const objectUtil = require("../helpers/objectUtil");
const z = require("./base"); // change
const null_1 = require("./null");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
const __1 = require("..");
const AugmentFactory = (def) => (augmentation) => {
    return new ZodObject({
        ...def,
        shape: {
            ...def.shape,
            ...augmentation,
        },
    });
};
const objectDefToJson = (def) => ({
    t: def.t,
    shape: Object.assign({}, Object.keys(def.shape).map((k) => ({
        [k]: def.shape[k].toJSON(),
    }))),
});
class ZodObject extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => objectDefToJson(this._def);
        this.nonstrict = () => new ZodObject({
            shape: this._def.shape,
            t: z.ZodTypes.object,
            params: {
                ...this._params,
                strict: false,
            },
        });
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        //
        this.augment = AugmentFactory(this._def);
        this.extend = AugmentFactory(this._def);
        /**
         * Prior to zod@1.0.12 there was a bug in the
         * inferred type of merged objects. Please
         * upgrade if you are experiencing issues.
         */
        this.merge = objectUtil.mergeObjects(this);
        this.pick = (mask) => {
            if (mask === true) {
                return this;
            }
            if (typeof mask !== 'object' || mask instanceof Array) {
                throw __1.ZodError.fromString(`Cannot pick keys from non-object type '${typeof mask}'`);
            }
            const unknownKeys = Object.keys(mask).filter((key) => !(key in this._def.shape));
            if (unknownKeys.length !== 0) {
                throw __1.ZodError.fromString(`Undefined key(s) for shape: ${unknownKeys.map((x) => `'${x}'`).join(', ')}`);
            }
            const shape = {};
            const maskObj = mask;
            Object.keys(mask).forEach((key) => {
                const subShape = this._def.shape[key];
                if (key in this._def.shape) {
                    if (maskObj[key] === true) {
                        shape[key] = subShape;
                    }
                    else if (typeof maskObj[key] === 'object') {
                        if (!(subShape instanceof ZodObject)) {
                            throw __1.ZodError.create([
                                {
                                    path: [`['${key}']`],
                                    message: `Value of type '${typeof subShape}' could not be parsed as a ZodObject`,
                                },
                            ]);
                        }
                        try {
                            const subObject = subShape.pick(maskObj[key]);
                            if (Object.keys(subObject).length !== 0) {
                                shape[key] = subObject;
                            }
                        }
                        catch (err) {
                            if (!(err instanceof __1.ZodError)) {
                                throw err;
                            }
                            throw err.bubbleUp(`['${key}']`);
                        }
                    }
                }
            });
            return new ZodObject({
                t: z.ZodTypes.object,
                params: this.params,
                shape,
            });
        };
        this.omit = (mask) => {
            if (typeof mask !== 'object' || mask instanceof Array) {
                throw __1.ZodError.fromString(`Cannot omit keys from non-object type '${typeof mask}'`);
            }
            const unknownKeys = Object.keys(mask).filter((key) => !(key in this._def.shape));
            if (unknownKeys.length !== 0) {
                throw __1.ZodError.fromString(`Undefined key(s) for shape: ${unknownKeys.map((x) => `'${x}'`).join(', ')}`);
            }
            const shape = {};
            const maskObj = mask;
            Object.keys(this._def.shape).forEach((key) => {
                const subShape = this._def.shape[key];
                if (!(key in mask) || (typeof maskObj[key] === 'boolean' && maskObj[key] !== true)) {
                    shape[key] = subShape;
                }
                else {
                    if (typeof maskObj[key] === 'object') {
                        if (!(subShape instanceof ZodObject)) {
                            throw __1.ZodError.create([
                                {
                                    path: [`['${key}']`],
                                    message: `Value of type '${typeof subShape}' could not be parsed as a ZodObject`,
                                },
                            ]);
                        }
                        try {
                            const subObject = subShape.omit(maskObj[key]);
                            if (Object.keys(subObject).length !== 0) {
                                shape[key] = subObject;
                            }
                        }
                        catch (err) {
                            if (!(err instanceof __1.ZodError)) {
                                throw err;
                            }
                            throw err.bubbleUp(`['${key}']`);
                        }
                    }
                }
            });
            return new ZodObject({
                t: z.ZodTypes.object,
                params: this.params,
                shape,
            });
        };
        this.partial = () => {
            const newShape = {};
            Object.keys(this.shape).forEach((k) => {
                newShape[k] = this.shape[k].optional();
            });
            return new ZodObject({
                ...this._def,
                shape: newShape,
            });
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.deepPartial = () => {
            const newShape = {};
            Object.keys(this.shape).forEach((k) => {
                const fieldSchema = this.shape[k];
                if (fieldSchema instanceof ZodObject) {
                    newShape[k] = fieldSchema.deepPartial().optional();
                }
                else {
                    newShape[k] = this.shape[k].optional();
                }
            });
            return new ZodObject({
                ...this._def,
                shape: newShape,
            });
        };
    }
    get shape() {
        return this._def.shape;
    }
    get params() {
        return this._def.params;
    }
}
exports.ZodObject = ZodObject;
ZodObject.create = (shape) => {
    return new ZodObject({
        t: z.ZodTypes.object,
        //  strict: true,
        shape,
        params: {
            strict: true,
        },
    });
};
//# sourceMappingURL=object.js.map