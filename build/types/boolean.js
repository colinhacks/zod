"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodBoolean = void 0;
const z = require("./base");
const null_1 = require("./null");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
class ZodBoolean extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => this._def;
    }
}
exports.ZodBoolean = ZodBoolean;
ZodBoolean.create = () => {
    return new ZodBoolean({
        t: z.ZodTypes.boolean,
    });
};
//# sourceMappingURL=boolean.js.map