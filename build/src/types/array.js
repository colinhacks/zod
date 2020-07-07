"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodNonEmptyArray = exports.ZodArray = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodArray extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => {
            return {
                t: this._def.t,
                nonempty: this._def.nonempty,
                type: this._def.type.toJSON(),
            };
        };
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.min = (minLength, msg) => this.refine((data) => data.length >= minLength, msg || `Array must contain ${minLength} or more items.`);
        this.max = (maxLength, msg) => this.refine((data) => data.length <= maxLength, msg || `Array must contain ${maxLength} or fewer items.`);
        this.length = (len, msg) => this.refine((data) => data.length === len, msg || `Array must contain ${len} items.`);
        this.nonempty = () => {
            return new ZodNonEmptyArray({ ...this._def, nonempty: true });
        };
    }
}
exports.ZodArray = ZodArray;
// pick = <Mask extends zodmaskUtil.Params<T>>(mask: Mask): ZodArray<zodmaskUtil.pick<T, Mask>> => {
//   return applyMask(this, mask, 'pick');
// };
// omit = <Mask extends zodmaskUtil.Params<T>>(mask: Mask): ZodArray<zodmaskUtil.omit<T, Mask>> => {
//   return applyMask(this, mask, 'omit');
// };
ZodArray.create = (schema) => {
    return new ZodArray({
        t: z.ZodTypes.array,
        type: schema,
        nonempty: false,
    });
};
// tslint:disable-next-line: max-classes-per-file
class ZodNonEmptyArray extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => {
            return {
                t: this._def.t,
                type: this._def.type.toJSON(),
            };
        };
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        // static create = <T extends z.ZodTypeAny>(schema: T): ZodArray<T> => {
        //   return new ZodArray({
        //     t: z.ZodTypes.array,
        //     nonempty: true,
        //     type: schema,
        //   });
        // };
    }
}
exports.ZodNonEmptyArray = ZodNonEmptyArray;
//# sourceMappingURL=array.js.map