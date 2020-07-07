"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodGeneric = void 0;
const base_1 = require("./base");
const null_1 = require("./null");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
class ZodGeneric extends base_1.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => {
            throw new Error('Cannot convert generic type to JSON');
        };
    }
}
exports.ZodGeneric = ZodGeneric;
ZodGeneric.create = (options, body) => {
    return new ZodGeneric({
        t: base_1.ZodTypes.generic,
        options,
        body,
    });
};
//# sourceMappingURL=generic.js.map