"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodUnion = void 0;
const z = require("./base");
const null_1 = require("./null");
const undefined_1 = require("./undefined");
class ZodUnion extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => ({
            t: this._def.t,
            options: this._def.options.map((x) => x.toJSON()),
        });
    }
}
exports.ZodUnion = ZodUnion;
ZodUnion.create = (types) => {
    return new ZodUnion({
        t: z.ZodTypes.union,
        options: types,
    });
};
ZodUnion.make = (...types) => {
    return new ZodUnion({
        t: z.ZodTypes.union,
        options: types,
    });
};
//# sourceMappingURL=union.js.map