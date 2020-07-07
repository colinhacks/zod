"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodUndefined = void 0;
const z = require("./base");
const union_1 = require("./union");
const null_1 = require("./null");
class ZodUndefined extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => this._def;
        this.optional = () => union_1.ZodUnion.create([this, ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
    }
}
exports.ZodUndefined = ZodUndefined;
ZodUndefined.create = () => {
    return new ZodUndefined({
        t: z.ZodTypes.undefined,
    });
};
//# sourceMappingURL=undefined.js.map