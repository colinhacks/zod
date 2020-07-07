"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodEnum = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodEnum extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => this._def;
    }
    get OptionsList() {
        return this._def.values;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
}
exports.ZodEnum = ZodEnum;
ZodEnum.create = (values) => {
    return new ZodEnum({
        t: z.ZodTypes.enum,
        values,
    });
};
//# sourceMappingURL=enum.js.map