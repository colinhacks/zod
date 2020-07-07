"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodNull = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
class ZodNull extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, ZodNull.create()]);
        this.toJSON = () => this._def;
    }
}
exports.ZodNull = ZodNull;
ZodNull.create = () => {
    return new ZodNull({
        t: z.ZodTypes.null,
    });
};
//# sourceMappingURL=null.js.map